import mongoose from "mongoose";
import { DatabaseConnectionError } from "@/src/server/shared/errors";

const globalForMongoose = globalThis as typeof globalThis & {
    mongooseConnection?: typeof mongoose | null;
    mongooseConnectionPromise?: Promise<typeof mongoose> | null;
};

export const getMongooseConnection = async (): Promise<typeof mongoose> => {
    const mongodbUrl = process.env.MONGODB_URL;
    if (!mongodbUrl) {
        console.error("[mongoose] MONGODB_URL não definida.");
        throw new Error("MONGODB_URL não definida.");
    }

    if (globalForMongoose.mongooseConnection) {
        return globalForMongoose.mongooseConnection;
    }

    if (!globalForMongoose.mongooseConnectionPromise) {
        globalForMongoose.mongooseConnectionPromise =
            mongoose.connect(mongodbUrl);
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

    return globalForMongoose.mongooseConnection;
};
