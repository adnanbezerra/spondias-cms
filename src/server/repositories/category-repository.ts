import { getPrismaClient } from "@/src/server/db/prisma";

export type CategoryRecord = {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
};

export type CategoryRepository = {
    list(): Promise<CategoryRecord[]>;
    findById(id: string): Promise<CategoryRecord | null>;
    findByName(name: string): Promise<CategoryRecord | null>;
    create(data: Pick<CategoryRecord, "name" | "isActive">): Promise<CategoryRecord>;
    update(id: string, data: Partial<Pick<CategoryRecord, "name" | "isActive">>): Promise<CategoryRecord | null>;
    delete(id: string): Promise<boolean>;
};

const categories = new Map<string, CategoryRecord>();

export const inMemoryCategoryRepository: CategoryRepository = {
    async list() {
        return [...categories.values()].sort((a, b) => a.name.localeCompare(b.name));
    },
    async findById(id) {
        return categories.get(id) ?? null;
    },
    async findByName(name) {
        const normalized = name.trim().toLowerCase();
        return [...categories.values()].find((category) => category.name.trim().toLowerCase() === normalized) ?? null;
    },
    async create(data) {
        const now = new Date();
        const record: CategoryRecord = {
            id: crypto.randomUUID(),
            name: data.name,
            isActive: data.isActive,
            createdAt: now,
            updatedAt: now,
        };

        categories.set(record.id, record);
        return record;
    },
    async update(id, data) {
        const current = categories.get(id);
        if (!current) return null;

        const updated: CategoryRecord = {
            ...current,
            ...data,
            updatedAt: new Date(),
        };

        categories.set(id, updated);
        return updated;
    },
    async delete(id) {
        return categories.delete(id);
    },
};

export const prismaCategoryRepository: CategoryRepository = {
    async list() {
        return getPrismaClient().category.findMany({
            orderBy: { name: "asc" },
        });
    },
    async findById(id) {
        return getPrismaClient().category.findUnique({
            where: { id },
        });
    },
    async findByName(name) {
        return getPrismaClient().category.findFirst({
            where: {
                name: {
                    equals: name.trim(),
                    mode: "insensitive",
                },
            },
        });
    },
    async create(data) {
        return getPrismaClient().category.create({
            data: {
                name: data.name,
                isActive: data.isActive,
            },
        });
    },
    async update(id, data) {
        const existing = await getPrismaClient().category.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!existing) return null;

        return getPrismaClient().category.update({
            where: { id },
            data,
        });
    },
    async delete(id) {
        const result = await getPrismaClient().category.deleteMany({
            where: { id },
        });

        return result.count > 0;
    },
};
