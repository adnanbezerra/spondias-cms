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
    list(): Promise<UserRecord[]>;
    findById(id: string): Promise<UserRecord | null>;
    findByEmail(email: string): Promise<UserRecord | null>;
    findByCpf(cpf: string): Promise<UserRecord | null>;
    findByEmailOrCpf(login: string): Promise<UserRecord | null>;
    create(
        data: Pick<UserRecord, "name" | "email" | "cpf" | "passwordHash">,
    ): Promise<UserRecord>;
    update(
        id: string,
        data: Partial<Pick<UserRecord, "name" | "email" | "cpf" | "isActive">>,
    ): Promise<UserRecord | null>;
};

const users = new Map<string, UserRecord>();

export const inMemoryUserRepository: UserRepository = {
    async list() {
        return [...users.values()];
    },
    async findById(id) {
        return users.get(id) ?? null;
    },
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
    async update(id, data) {
        const found = users.get(id);
        if (!found) {
            return null;
        }

        const updated: UserRecord = {
            ...found,
            ...data,
            updatedAt: new Date(),
        };
        users.set(id, updated);

        return updated;
    },
};

export const prismaUserRepository: UserRepository = {
    async list() {
        const users = await getPrismaClient().user.findMany({
            orderBy: { createdAt: "desc" },
        });

        return users;
    },
    async findById(id) {
        const user = await getPrismaClient().user.findUnique({
            where: { id },
        });

        return user;
    },
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
    async update(id, data) {
        try {
            const user = await getPrismaClient().user.update({
                where: { id },
                data,
            });

            return user;
        } catch {
            return null;
        }
    },
};
