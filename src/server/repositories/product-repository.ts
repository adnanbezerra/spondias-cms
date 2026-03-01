import { getPrismaClient } from "@/src/server/db/prisma";

export type ProductRecord = {
    id: string;
    name: string;
    price: number;
    stock: number;
    discountPercentage: number;
    image: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
};

export type ProductRepository = {
    list(): Promise<ProductRecord[]>;
    findById(id: string): Promise<ProductRecord | null>;
    findByName(name: string): Promise<ProductRecord | null>;
    create(
        data: Pick<
            ProductRecord,
      "name" | "price" | "stock" | "discountPercentage" | "image" | "isActive"
        >,
    ): Promise<ProductRecord>;
    update(
        id: string,
        data: Partial<
            Pick<
                ProductRecord,
        "name" | "price" | "stock" | "discountPercentage" | "image" | "isActive"
            >
        >,
    ): Promise<ProductRecord | null>;
    delete(id: string): Promise<boolean>;
    replaceSections(productId: string, sectionIds: string[]): Promise<void>;
    listSectionIds(productId: string): Promise<string[]>;
};

export const prismaProductRepository: ProductRepository = {
    async list() {
        return getPrismaClient().product.findMany({
            orderBy: [{ createdAt: "desc" }, { name: "asc" }],
        });
    },
    async findById(id) {
        return getPrismaClient().product.findUnique({
            where: { id },
        });
    },
    async findByName(name) {
        return getPrismaClient().product.findFirst({
            where: {
                name: {
                    equals: name.trim(),
                    mode: "insensitive",
                },
            },
        });
    },
    async create(data) {
        return getPrismaClient().product.create({
            data,
        });
    },
    async update(id, data) {
        const existing = await getPrismaClient().product.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!existing) return null;

        return getPrismaClient().product.update({
            where: { id },
            data,
        });
    },
    async delete(id) {
        const result = await getPrismaClient().product.deleteMany({
            where: { id },
        });

        return result.count > 0;
    },
    async replaceSections(productId, sectionIds) {
        await getPrismaClient().$transaction([
            getPrismaClient().productSection.deleteMany({
                where: { productId },
            }),
            ...(sectionIds.length > 0
                ? [
                    getPrismaClient().productSection.createMany({
                        data: sectionIds.map((sectionId) => ({
                            productId,
                            sectionId,
                        })),
                        skipDuplicates: true,
                    }),
                ]
                : []),
        ]);
    },
    async listSectionIds(productId) {
        const rows = await getPrismaClient().productSection.findMany({
            where: { productId },
            select: { sectionId: true },
            orderBy: { sectionId: "asc" },
        });

        return rows.map((row) => row.sectionId);
    },
};
