import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
    prisma?: PrismaClient;
};

export const getPrismaClient = (): PrismaClient => {
    if (!globalForPrisma.prisma) {
        globalForPrisma.prisma = new PrismaClient();
    }

    return globalForPrisma.prisma;
};
