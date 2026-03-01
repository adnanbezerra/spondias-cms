import { getPrismaClient } from "@/src/server/db/prisma";

export type SectionRecord = {
    id: string;
    name: string;
    isActive: boolean;
    order: number;
    isBanner: boolean;
    bannerImg: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export type SectionRepository = {
    list(): Promise<SectionRecord[]>;
    findById(id: string): Promise<SectionRecord | null>;
    findByName(name: string): Promise<SectionRecord | null>;
    create(
        data: Pick<SectionRecord, "name" | "isActive" | "order" | "isBanner" | "bannerImg">,
    ): Promise<SectionRecord>;
    update(
        id: string,
        data: Partial<Pick<SectionRecord, "name" | "isActive" | "order" | "isBanner" | "bannerImg">>,
    ): Promise<SectionRecord | null>;
    delete(id: string): Promise<boolean>;
    replaceCategories(sectionId: string, categoryIds: string[]): Promise<void>;
    listCategoryIds(sectionId: string): Promise<string[]>;
};

export const prismaSectionRepository: SectionRepository = {
    async list() {
        return getPrismaClient().section.findMany({
            orderBy: [{ order: "asc" }, { name: "asc" }],
        });
    },
    async findById(id) {
        return getPrismaClient().section.findUnique({
            where: { id },
        });
    },
    async findByName(name) {
        return getPrismaClient().section.findFirst({
            where: {
                name: {
                    equals: name.trim(),
                    mode: "insensitive",
                },
            },
        });
    },
    async create(data) {
        return getPrismaClient().section.create({
            data,
        });
    },
    async update(id, data) {
        const existing = await getPrismaClient().section.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!existing) return null;

        return getPrismaClient().section.update({
            where: { id },
            data,
        });
    },
    async delete(id) {
        const result = await getPrismaClient().section.deleteMany({
            where: { id },
        });

        return result.count > 0;
    },
    async replaceCategories(sectionId, categoryIds) {
        await getPrismaClient().$transaction([
            getPrismaClient().sectionCategory.deleteMany({
                where: { sectionId },
            }),
            ...(categoryIds.length > 0
                ? [
                    getPrismaClient().sectionCategory.createMany({
                        data: categoryIds.map((categoryId) => ({
                            sectionId,
                            categoryId,
                        })),
                        skipDuplicates: true,
                    }),
                ]
                : []),
        ]);
    },
    async listCategoryIds(sectionId) {
        const rows = await getPrismaClient().sectionCategory.findMany({
            where: { sectionId },
            select: { categoryId: true },
            orderBy: { categoryId: "asc" },
        });

        return rows.map((row) => row.categoryId);
    },
};
