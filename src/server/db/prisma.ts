type PrismaClientLike = {
  $disconnect: () => Promise<void>;
};

let clientPromise: Promise<PrismaClientLike> | null = null;

export const getPrismaClient = async (): Promise<PrismaClientLike> => {
  if (!clientPromise) {
    clientPromise = import("@prisma/client")
      .then(({ PrismaClient }) => {
        const globalForPrisma = globalThis as typeof globalThis & {
          prisma?: PrismaClientLike;
        };

        if (!globalForPrisma.prisma) {
          globalForPrisma.prisma = new PrismaClient();
        }

        return globalForPrisma.prisma as PrismaClientLike;
      })
      .catch(() => {
        throw new Error(
          "@prisma/client não está disponível. Instale dependências para usar o banco de dados.",
        );
      });
  }

  return clientPromise;
};
