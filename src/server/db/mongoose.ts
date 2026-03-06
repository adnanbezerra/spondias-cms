import mongoose from "mongoose";
import { DatabaseConnectionError } from "@/src/server/shared/errors";

const globalForMongoose = globalThis as typeof globalThis & {
    mongooseConnection?: typeof mongoose | null;
    mongooseConnectionPromise?: Promise<typeof mongoose> | null;
};

export const getMongooseConnection = async (): Promise<typeof mongoose> => {
    console.log("[mongoose] getMongooseConnection chamado.");

    const mongodbUrl = process.env.MONGODB_URL;
    if (!mongodbUrl) {
        console.error("[mongoose] MONGODB_URL não definida.");
        throw new Error("MONGODB_URL não definida.");
    }

    if (globalForMongoose.mongooseConnection) {
        console.log(
            `[mongoose] Reutilizando conexão em cache para o banco "${globalForMongoose.mongooseConnection.connection.name}".`,
        );
        return globalForMongoose.mongooseConnection;
    }

    if (!globalForMongoose.mongooseConnectionPromise) {
        console.log("[mongoose] Iniciando nova conexão com MongoDB...");
        globalForMongoose.mongooseConnectionPromise =
            mongoose.connect(mongodbUrl);
    } else {
        console.log(
            "[mongoose] Aguardando promise de conexão já existente no cache.",
        );
    }

    try {
        globalForMongoose.mongooseConnection =
            await globalForMongoose.mongooseConnectionPromise;
    } catch (error) {
        globalForMongoose.mongooseConnectionPromise = null;
        const details =
            error instanceof Error ? error.message : "erro desconhecido";
        console.error("[mongoose] Falha ao conectar no MongoDB:", error);
        throw new DatabaseConnectionError(
            `Falha ao conectar no MongoDB: ${details}`,
        );
    }

    console.log(
        `[mongoose] Conectado com sucesso ao banco "${globalForMongoose.mongooseConnection.connection.name}".`,
    );

    return globalForMongoose.mongooseConnection;
};
