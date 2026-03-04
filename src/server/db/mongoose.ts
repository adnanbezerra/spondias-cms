import mongoose from "mongoose";

const globalForMongoose = globalThis as typeof globalThis & {
    mongooseConnection?: typeof mongoose | null;
    mongooseConnectionPromise?: Promise<typeof mongoose> | null;
};

export const getMongooseConnection = async (): Promise<typeof mongoose> => {
    const mongodbUrl = process.env.MONGODB_URL;
    if (!mongodbUrl) {
        throw new Error("MONGODB_URL não definida.");
    }

    if (globalForMongoose.mongooseConnection) {
        return globalForMongoose.mongooseConnection;
    }

    if (!globalForMongoose.mongooseConnectionPromise) {
        globalForMongoose.mongooseConnectionPromise = mongoose.connect(
            mongodbUrl,
        );
    }

    globalForMongoose.mongooseConnection =
        await globalForMongoose.mongooseConnectionPromise;

    return globalForMongoose.mongooseConnection;
};
