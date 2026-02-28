import { getPrismaClient } from "@/src/server/db/prisma";

export type StoreConfigRecord = {
  id: string;
  whatsappNumber: string;
  email: string;
  address: string;
  companyName: string;
  cnpj: string;
  updatedAt: Date;
};

export type StoreConfigRepository = {
  get(): Promise<StoreConfigRecord>;
  update(data: Omit<StoreConfigRecord, "id" | "updatedAt">): Promise<StoreConfigRecord>;
};

let config: StoreConfigRecord = {
  id: crypto.randomUUID(),
  whatsappNumber: process.env.STORE_DEFAULT_WHATSAPP ?? "",
  email: process.env.STORE_DEFAULT_EMAIL ?? "",
  address: process.env.STORE_DEFAULT_ADDRESS ?? "",
  companyName: process.env.STORE_DEFAULT_COMPANY_NAME ?? "",
  cnpj: process.env.STORE_DEFAULT_CNPJ ?? "",
  updatedAt: new Date(),
};

export const inMemoryStoreConfigRepository: StoreConfigRepository = {
  async get() {
    return config;
  },
  async update(data) {
    config = {
      ...config,
      ...data,
      updatedAt: new Date(),
    };

    return config;
  },
};

const getDefaultStoreConfigInput = (): Omit<StoreConfigRecord, "id" | "updatedAt"> => ({
  whatsappNumber: process.env.STORE_DEFAULT_WHATSAPP ?? "",
  email: process.env.STORE_DEFAULT_EMAIL ?? "",
  address: process.env.STORE_DEFAULT_ADDRESS ?? "",
  companyName: process.env.STORE_DEFAULT_COMPANY_NAME ?? "",
  cnpj: process.env.STORE_DEFAULT_CNPJ ?? "",
});

export const prismaStoreConfigRepository: StoreConfigRepository = {
  async get() {
    const prisma = getPrismaClient();
    const existing = await prisma.storeConfig.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    if (existing) {
      return existing;
    }

    return prisma.storeConfig.create({
      data: getDefaultStoreConfigInput(),
    });
  },
  async update(data) {
    const prisma = getPrismaClient();
    const existing = await prisma.storeConfig.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    });

    if (!existing) {
      return prisma.storeConfig.create({
        data,
      });
    }

    return prisma.storeConfig.update({
      where: { id: existing.id },
      data,
    });
  },
};
