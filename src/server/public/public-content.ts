import { getPrismaClient } from "@/src/server/db/prisma";
import type { Prisma } from "@prisma/client";
import { CategoryService } from "@/src/server/services/category-service";
import { StoreConfigService } from "@/src/server/services/store-config-service";

const categoryService = new CategoryService();
const storeConfigService = new StoreConfigService();

const sectionWithCategoriesArgs = {
    include: {
        categories: true,
    },
} satisfies Prisma.SectionDefaultArgs;

type SectionWithCategories = Prisma.SectionGetPayload<
    typeof sectionWithCategoriesArgs
>;

type ProductEntity = {
    id: string;
    name: string;
    price: number;
    discountPercentage: number;
    stock: number;
    image: string | null;
    isActive: boolean;
};

export type PublicStoreConfig = {
    whatsappNumber: string;
    email: string;
    address: string;
    companyName: string;
    cnpj: string;
};

export type PublicCategory = {
    id: string;
    name: string;
};

export type PublicProduct = {
    id: string;
    name: string;
    priceInCents: number;
    discountPercentage: number;
    stock: number;
    image: string;
    description: string;
};

export type PublicSection = {
    id: string;
    name: string;
    description: string;
    isBanner: boolean;
    bannerImage: string | null;
    products: PublicProduct[];
};

export type PublicCategoryDetails = {
    id: string;
    name: string;
    products: PublicProduct[];
};

const emptyStoreConfig: PublicStoreConfig = {
    whatsappNumber: "",
    email: "",
    address: "",
    companyName: "",
    cnpj: "",
};

const normalizeWhatsAppNumber = (value: string): string =>
    value.replace(/\D/g, "");

export const buildWhatsAppUrl = (phone: string, message: string): string => {
    const phoneDigits = normalizeWhatsAppNumber(phone);
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phoneDigits}?text=${encodedMessage}`;
};

export const formatBRL = (valueInCents: number): string =>
    new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(valueInCents / 100);

export const getPublicStoreConfig = async (): Promise<PublicStoreConfig> => {
    try {
        const result = await storeConfigService.get();
        return {
            whatsappNumber: result.value.whatsappNumber,
            email: result.value.email,
            address: result.value.address,
            companyName: result.value.companyName,
            cnpj: result.value.cnpj,
        };
    } catch {
        return emptyStoreConfig;
    }
};

export const getPublicCategories = async (): Promise<PublicCategory[]> => {
    try {
        const result = await categoryService.list();
        return result.value
            .filter((category) => category.isActive)
            .map((category) => ({ id: category.id, name: category.name }));
    } catch {
        return [];
    }
};

const mapProductToPublicProduct = (
    product: ProductEntity,
    context: string,
): PublicProduct | null => {
    if (!product.isActive) {
        return null;
    }

    return {
        id: product.id,
        name: product.name,
        priceInCents: product.price,
        discountPercentage: product.discountPercentage,
        stock: product.stock,
        image: product.image ?? "/logo.jpg",
        description: context,
    };
};

const getProductsByCategoryIds = async (
    categoryIds: string[],
    context: string,
): Promise<PublicProduct[]> => {
    if (categoryIds.length === 0) {
        return [];
    }

    const products = await getPrismaClient().product.findMany({
        where: {
            isActive: true,
            categories: {
                some: {
                    categoryId: {
                        in: categoryIds,
                    },
                },
            },
        },
        orderBy: [{ name: "asc" }, { createdAt: "desc" }],
    });

    return products
        .map((product) => mapProductToPublicProduct(product, context))
        .filter((product): product is PublicProduct => product !== null);
};

const mapSectionToPublicSection = async (
    section: SectionWithCategories,
): Promise<PublicSection> => {
    const categoryIds = section.categories.map((relation) => relation.categoryId);

    return {
        id: section.id,
        name: section.name,
        description: section.isBanner
            ? "Banner promocional configurado no painel administrativo."
            : "Produtos selecionados para esta seção.",
        isBanner: section.isBanner,
        bannerImage: section.bannerImg,
        products: await getProductsByCategoryIds(categoryIds, section.name),
    };
};

export const getCategoryProducts = async (
    categoryId: string,
): Promise<PublicProduct[]> => {
    try {
        return await getProductsByCategoryIds([categoryId], "Categoria");
    } catch {
        return [];
    }
};

export const getHomeSections = async (): Promise<PublicSection[]> => {
    try {
        const sections: SectionWithCategories[] =
            await getPrismaClient().section.findMany({
                where: { isActive: true },
                ...sectionWithCategoriesArgs,
                orderBy: [{ order: "asc" }, { name: "asc" }],
            });

        return Promise.all(sections.map((section) => mapSectionToPublicSection(section)));
    } catch {
        return [];
    }
};

export const getSectionById = async (
    sectionId: string,
): Promise<PublicSection | null> => {
    try {
        const section: SectionWithCategories | null =
            await getPrismaClient().section.findFirst({
                where: {
                    id: sectionId,
                    isActive: true,
                },
                ...sectionWithCategoriesArgs,
            });

        if (!section) {
            return null;
        }

        return mapSectionToPublicSection(section);
    } catch {
        return null;
    }
};

export const getCategoryById = async (
    categoryId: string,
): Promise<PublicCategoryDetails | null> => {
    try {
        const category = await getPrismaClient().category.findFirst({
            where: {
                id: categoryId,
                isActive: true,
            },
        });

        if (!category) {
            return null;
        }

        return {
            id: category.id,
            name: category.name,
            products: await getCategoryProducts(category.id),
        };
    } catch {
        return null;
    }
};
