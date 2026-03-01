import { getPrismaClient } from "@/src/server/db/prisma";

export type UserRecord = {
    id: string;
    name: string;
    email: string;
    cpf: string;
    passwordHash: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
};

export type UserRepository = {
    findByEmail(email: string): Promise<UserRecord | null>;
    findByCpf(cpf: string): Promise<UserRecord | null>;
    findByEmailOrCpf(login: string): Promise<UserRecord | null>;
    create(
        data: Pick<UserRecord, "name" | "email" | "cpf" | "passwordHash">,
    ): Promise<UserRecord>;
};

const users = new Map<string, UserRecord>();

export const inMemoryUserRepository: UserRepository = {
    async findByEmail(email) {
        return [...users.values()].find((user) => user.email === email) ?? null;
    },
    async findByCpf(cpf) {
        return [...users.values()].find((user) => user.cpf === cpf) ?? null;
    },
    async findByEmailOrCpf(login) {
        return (
            [...users.values()].find(
                (user) => user.email === login || user.cpf === login,
            ) ?? null
        );
    },
    async create(data) {
        const now = new Date();
        const user: UserRecord = {
            id: crypto.randomUUID(),
            name: data.name,
            email: data.email,
            cpf: data.cpf,
            passwordHash: data.passwordHash,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        };

        users.set(user.id, user);
        return user;
    },
};

export const prismaUserRepository: UserRepository = {
    async findByEmail(email) {
        const user = await getPrismaClient().user.findUnique({
            where: { email },
        });

        return user;
    },
    async findByCpf(cpf) {
        const user = await getPrismaClient().user.findUnique({
            where: { cpf },
        });

        return user;
    },
    async findByEmailOrCpf(login) {
        const user = await getPrismaClient().user.findFirst({
            where: {
                OR: [{ email: login }, { cpf: login }],
            },
        });

        return user;
    },
    async create(data) {
        const user = await getPrismaClient().user.create({
            data: {
                name: data.name,
                email: data.email,
                cpf: data.cpf,
                passwordHash: data.passwordHash,
            },
        });

        return user;
    },
};
