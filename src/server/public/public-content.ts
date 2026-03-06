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
    description: string;
    price: number;
    discountPercentage: number;
    stock: number;
    image: string | null;
    isActive: boolean;
    categories: Array<{ categoryId: string; category: { name: string; isActive: boolean } }>;
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
    categoryIds: string[];
    categoryNames: string[];
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

export type PublicRelatedProductsByCategory = {
    categoryId: string;
    categoryName: string;
    products: PublicProduct[];
};

export type PublicProductDetails = {
    product: PublicProduct;
    relatedByCategory: PublicRelatedProductsByCategory[];
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

const mapProductToPublicProduct = (product: ProductEntity): PublicProduct | null => {
    if (!product.isActive) {
        return null;
    }

    const activeCategories = product.categories.filter((item) => item.category.isActive);

    return {
        id: product.id,
        name: product.name,
        priceInCents: product.price,
        discountPercentage: product.discountPercentage,
        stock: product.stock,
        image: product.image ?? "/logo.jpg",
        description: product.description,
        categoryIds: activeCategories.map((item) => item.categoryId),
        categoryNames: activeCategories.map((item) => item.category.name),
    };
};

const productIncludeArgs = {
    include: {
        categories: {
            include: {
                category: {
                    select: {
                        name: true,
                        isActive: true,
                    },
                },
            },
            orderBy: {
                categoryId: "asc",
            },
        },
    },
} satisfies Prisma.ProductDefaultArgs;

const getProductsByCategoryIds = async (
    categoryIds: string[],
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
        ...productIncludeArgs,
        orderBy: [{ name: "asc" }, { createdAt: "desc" }],
    });

    return products
        .map((product) => mapProductToPublicProduct(product))
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
        products: await getProductsByCategoryIds(categoryIds),
    };
};

export const getCategoryProducts = async (
    categoryId: string,
): Promise<PublicProduct[]> => {
    try {
        return await getProductsByCategoryIds([categoryId]);
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

export const getPublicProductDetailsById = async (
    productId: string,
): Promise<PublicProductDetails | null> => {
    try {
        const product = await getPrismaClient().product.findFirst({
            where: {
                id: productId,
                isActive: true,
            },
            ...productIncludeArgs,
        });

        if (!product) {
            return null;
        }

        const publicProduct = mapProductToPublicProduct(product);
        if (!publicProduct) {
            return null;
        }

        const relatedByCategory: PublicRelatedProductsByCategory[] = [];
        for (const relation of product.categories) {
            if (!relation.category.isActive) {
                continue;
            }

            const sameCategoryProducts = await getPrismaClient().product.findMany({
                where: {
                    id: { not: product.id },
                    isActive: true,
                    categories: {
                        some: {
                            categoryId: relation.categoryId,
                        },
                    },
                },
                ...productIncludeArgs,
                orderBy: [{ name: "asc" }],
                take: 8,
            });

            relatedByCategory.push({
                categoryId: relation.categoryId,
                categoryName: relation.category.name,
                products: sameCategoryProducts
                    .map((item) => mapProductToPublicProduct(item))
                    .filter((item): item is PublicProduct => item !== null),
            });
        }

        return {
            product: publicProduct,
            relatedByCategory,
        };
    } catch {
        return null;
    }
};
