import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as typeof globalThis & {
    prisma?: PrismaClient;
};

export const getPrismaClient = (): PrismaClient => {
    console.log("[prisma] getPrismaClient chamado.");

    if (!globalForPrisma.prisma) {
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            console.error("[prisma] DATABASE_URL não definida.");
            throw new Error("DATABASE_URL não definida.");
        }

        console.log("[prisma] Criando novo PrismaClient...");
        const pool = new Pool({
            connectionString: databaseUrl,
        });
        pool.on("error", (error) => {
            console.error("[prisma] Erro no pool PostgreSQL:", error);
        });
        const adapter = new PrismaPg(pool);
        globalForPrisma.prisma = new PrismaClient({ adapter });
        console.log("[prisma] PrismaClient criado com sucesso.");
    } else {
        console.log("[prisma] Reutilizando PrismaClient em cache.");
    }

    return globalForPrisma.prisma;
};
