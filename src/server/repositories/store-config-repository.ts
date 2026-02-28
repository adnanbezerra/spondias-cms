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
