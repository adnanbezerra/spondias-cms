import { getPrismaClient } from "@/src/server/db/prisma";

export type ProductRecord = {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    discountPercentage: number;
    image: string | null;
    isActive: boolean;
    categoryIds: string[];
    createdAt: Date;
    updatedAt: Date;
};

type ProductRow = {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    discountPercentage: number;
    image: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    categories: Array<{ categoryId: string }>;
};

const mapRowToRecord = (row: ProductRow): ProductRecord => ({
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    stock: row.stock,
    discountPercentage: row.discountPercentage,
    image: row.image,
    isActive: row.isActive,
    categoryIds: row.categories.map((category) => category.categoryId),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
});

export type ProductRepository = {
    list(): Promise<ProductRecord[]>;
    findById(id: string): Promise<ProductRecord | null>;
    findByName(name: string): Promise<ProductRecord | null>;
    create(data: {
        name: string;
        description: string;
        price: number;
        stock: number;
        discountPercentage: number;
        image: string | null;
        isActive: boolean;
        categoryIds: string[];
    }): Promise<ProductRecord>;
    update(
        id: string,
        data: Partial<{
            name: string;
            description: string;
            price: number;
            stock: number;
            discountPercentage: number;
            image: string | null;
            isActive: boolean;
            categoryIds: string[];
        }>,
    ): Promise<ProductRecord | null>;
    delete(id: string): Promise<boolean>;
};

export const prismaProductRepository: ProductRepository = {
    async list() {
        const rows = await getPrismaClient().product.findMany({
            include: {
                categories: {
                    select: {
                        categoryId: true,
                    },
                    orderBy: {
                        categoryId: "asc",
                    },
                },
            },
            orderBy: [{ createdAt: "desc" }, { name: "asc" }],
        });

        return rows.map((row) => mapRowToRecord(row));
    },
    async findById(id) {
        const row = await getPrismaClient().product.findUnique({
            where: { id },
            include: {
                categories: {
                    select: { categoryId: true },
                    orderBy: { categoryId: "asc" },
                },
            },
        });

        if (!row) return null;
        return mapRowToRecord(row);
    },
    async findByName(name) {
        const row = await getPrismaClient().product.findFirst({
            where: {
                name: {
                    equals: name.trim(),
                    mode: "insensitive",
                },
            },
            include: {
                categories: {
                    select: { categoryId: true },
                    orderBy: { categoryId: "asc" },
                },
            },
        });

        if (!row) return null;
        return mapRowToRecord(row);
    },
    async create(data) {
        const row = await getPrismaClient().product.create({
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                stock: data.stock,
                discountPercentage: data.discountPercentage,
                image: data.image,
                isActive: data.isActive,
                categories: {
                    createMany: {
                        data: data.categoryIds.map((categoryId) => ({
                            categoryId,
                        })),
                        skipDuplicates: true,
                    },
                },
            },
            include: {
                categories: {
                    select: { categoryId: true },
                    orderBy: { categoryId: "asc" },
                },
            },
        });

        return mapRowToRecord(row);
    },
    async update(id, data) {
        const existing = await getPrismaClient().product.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!existing) return null;

        const row = await getPrismaClient().product.update({
            where: { id },
            data: {
                ...(data.name !== undefined ? { name: data.name } : {}),
                ...(data.description !== undefined
                    ? { description: data.description }
                    : {}),
                ...(data.price !== undefined ? { price: data.price } : {}),
                ...(data.stock !== undefined ? { stock: data.stock } : {}),
                ...(data.discountPercentage !== undefined
                    ? { discountPercentage: data.discountPercentage }
                    : {}),
                ...(data.image !== undefined ? { image: data.image } : {}),
                ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
                ...(data.categoryIds !== undefined
                    ? {
                        categories: {
                            deleteMany: {},
                            createMany: {
                                data: data.categoryIds.map((categoryId) => ({
                                    categoryId,
                                })),
                                skipDuplicates: true,
                            },
                        },
                    }
                    : {}),
            },
            include: {
                categories: {
                    select: { categoryId: true },
                    orderBy: { categoryId: "asc" },
                },
            },
        });

        return mapRowToRecord(row);
    },
    async delete(id) {
        const result = await getPrismaClient().product.deleteMany({
            where: { id },
        });

        return result.count > 0;
    },
};
