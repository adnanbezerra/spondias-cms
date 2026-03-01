import {
    prismaUserRepository,
    type UserRepository,
} from "@/src/server/repositories/user-repository";
import { comparePassword, hashPassword } from "@/src/server/security/password";
import { signJwt } from "@/src/server/security/jwt";
import {
    ConflictError,
    UnauthorizedError,
    ValidationError,
} from "@/src/server/shared/errors";
import { left, right, type Either } from "@/src/server/shared/either";
import {
    authResponseSchema,
    type AuthResponse,
    type LoginInput,
    type RegisterInput,
} from "@/src/server/validators/auth";

export type AuthError = ValidationError | ConflictError | UnauthorizedError;

export class AuthService {
    constructor(
        private readonly userRepository: UserRepository = prismaUserRepository,
    ) {}

    async register(
        input: RegisterInput,
    ): Promise<Either<AuthError, AuthResponse>> {
        const emailAlreadyUsed = await this.userRepository.findByEmail(
            input.email,
        );
        if (emailAlreadyUsed) {
            return left(new ConflictError("Email já cadastrado."));
        }

        const cpfAlreadyUsed = await this.userRepository.findByCpf(input.cpf);
        if (cpfAlreadyUsed) {
            return left(new ConflictError("CPF já cadastrado."));
        }

        const createdUser = await this.userRepository.create({
            email: input.email,
            cpf: input.cpf,
            passwordHash: hashPassword(input.password),
        });

        const token = signJwt({
            sub: createdUser.id,
            email: createdUser.email,
            role: "admin",
        });

        const response = authResponseSchema.parse({
            token,
            user: {
                id: createdUser.id,
                email: createdUser.email,
                cpf: createdUser.cpf,
            },
        });

        return right(response);
    }

    async login(input: LoginInput): Promise<Either<AuthError, AuthResponse>> {
        const user = await this.userRepository.findByEmailOrCpf(input.login);

        if (
            !user ||
            !user.isActive ||
            !comparePassword(input.password, user.passwordHash)
        ) {
            return left(new UnauthorizedError("Credenciais inválidas."));
        }

        const token = signJwt({
            sub: user.id,
            email: user.email,
            role: "admin",
        });

        const response = authResponseSchema.parse({
            token,
            user: {
                id: user.id,
                email: user.email,
                cpf: user.cpf,
            },
        });

        return right(response);
    }
}
