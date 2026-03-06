import {
    prismaUserRepository,
    type UserRepository,
} from "@/src/server/repositories/user-repository";
import { hashPassword } from "@/src/server/security/password";
import {
    ConflictError,
    NotFoundError,
    ValidationError,
} from "@/src/server/shared/errors";
import { left, right, type Either } from "@/src/server/shared/either";
import {
    userOutputSchema,
    type UserCreateInput,
    type UserOutput,
    type UserUpdateInput,
} from "@/src/server/validators/user";
import { isProtectedAdminEmail } from "@/src/shared/admin-users";

export type AdminUserError = ConflictError | NotFoundError | ValidationError;

export class AdminUserService {
    constructor(
        private readonly userRepository: UserRepository = prismaUserRepository,
    ) {}

    async list(): Promise<Either<never, UserOutput[]>> {
        const users = await this.userRepository.list();
        return right(users.map((item) => userOutputSchema.parse(item)));
    }

    async create(
        input: UserCreateInput,
    ): Promise<Either<AdminUserError, UserOutput>> {
        const normalizedEmail = input.email.trim().toLowerCase();

        const emailAlreadyUsed =
            await this.userRepository.findByEmail(normalizedEmail);
        if (emailAlreadyUsed) {
            return left(new ConflictError("Email já cadastrado."));
        }

        const cpfAlreadyUsed = await this.userRepository.findByCpf(input.cpf);
        if (cpfAlreadyUsed) {
            return left(new ConflictError("CPF já cadastrado."));
        }

        if (!input.isActive && isProtectedAdminEmail(normalizedEmail)) {
            return left(
                new ValidationError(
                    "Não é permitido desativar o usuário adnanbezerra@proton.me.",
                ),
            );
        }

        const created = await this.userRepository.create({
            name: input.name,
            email: normalizedEmail,
            cpf: input.cpf,
            passwordHash: hashPassword(input.password),
        });

        if (!input.isActive) {
            const deactivated = await this.userRepository.update(created.id, {
                isActive: false,
            });
            if (!deactivated) {
                return left(new NotFoundError("Usuário não encontrado."));
            }
            return right(userOutputSchema.parse(deactivated));
        }

        return right(userOutputSchema.parse(created));
    }

    async update(
        id: string,
        input: UserUpdateInput,
    ): Promise<Either<AdminUserError, UserOutput>> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            return left(new NotFoundError("Usuário não encontrado."));
        }

        if (!input.isActive && isProtectedAdminEmail(user.email)) {
            return left(
                new ValidationError(
                    "Não é permitido desativar o usuário adnanbezerra@proton.me.",
                ),
            );
        }

        const updated = await this.userRepository.update(id, {
            isActive: input.isActive,
        });

        if (!updated) {
            return left(new NotFoundError("Usuário não encontrado."));
        }

        return right(userOutputSchema.parse(updated));
    }
}
