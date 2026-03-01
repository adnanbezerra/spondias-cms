import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("DATABASE_URL não definida.");
}

const globalForPrisma = globalThis as typeof globalThis & {
    prisma?: PrismaClient;
};

export const getPrismaClient = (): PrismaClient => {
    if (!globalForPrisma.prisma) {
        const pool = new Pool({
            connectionString: databaseUrl,
        });
        const adapter = new PrismaPg(pool);
        globalForPrisma.prisma = new PrismaClient({ adapter });
    }

    return globalForPrisma.prisma;
};
