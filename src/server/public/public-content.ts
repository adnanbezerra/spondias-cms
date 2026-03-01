import { getPrismaClient } from "@/src/server/db/prisma";
import { Prisma } from "@prisma/client";
import { CategoryService } from "@/src/server/services/category-service";
import { StoreConfigService } from "@/src/server/services/store-config-service";

const categoryService = new CategoryService();
const storeConfigService = new StoreConfigService();

const sectionWithProductsArgs =
    Prisma.validator<Prisma.SectionDefaultArgs>()({
        include: {
            products: {
                include: {
                    product: true,
                },
            },
        },
    });

type SectionWithProducts = Prisma.SectionGetPayload<typeof sectionWithProductsArgs>;
type ProductSectionItem = SectionWithProducts["products"][number];

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

const mapProductSectionToPublicProduct = (
    productSection: ProductSectionItem,
    sectionName: string,
): PublicProduct | null => {
    const { product } = productSection;
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
        description: sectionName,
    };
};

const mapSectionToPublicSection = (section: SectionWithProducts): PublicSection => ({
    id: section.id,
    name: section.name,
    description: section.isBanner
        ? "Banner promocional configurado no painel administrativo."
        : "Produtos selecionados para esta seção.",
    isBanner: section.isBanner,
    bannerImage: section.bannerImg,
    products: section.products
        .map((productSection) =>
            mapProductSectionToPublicProduct(productSection, section.name),
        )
        .filter((product): product is PublicProduct => product !== null),
});

export const getCategoryProducts = async (
    categoryId: string,
): Promise<PublicProduct[]> => {
    try {
        const sections = await getPrismaClient().section.findMany({
            where: {
                isActive: true,
                categories: {
                    some: {
                        categoryId,
                    },
                },
            },
            include: {
                products: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: [{ order: "asc" }, { name: "asc" }],
        });

        const productsMap = new Map<string, PublicProduct>();

        sections.forEach((section) => {
            section.products.forEach((productSection) => {
                const product = mapProductSectionToPublicProduct(
                    productSection,
                    section.name,
                );
                if (!product) return;

                productsMap.set(product.id, product);
            });
        });

        const products = [...productsMap.values()].sort((a, b) =>
            a.name.localeCompare(b.name),
        );

        if (products.length > 0) {
            return products;
        }
    } catch {
        // Ignore and return empty list below.
    }

    return [];
};

export const getHomeSections = async (): Promise<PublicSection[]> => {
    try {
        const sections: SectionWithProducts[] =
            await getPrismaClient().section.findMany({
                where: { isActive: true },
                ...sectionWithProductsArgs,
                orderBy: [{ order: "asc" }, { name: "asc" }],
            });

        return sections.map((section) => mapSectionToPublicSection(section));
    } catch {
        return [];
    }
};

export const getSectionById = async (
    sectionId: string,
): Promise<PublicSection | null> => {
    try {
        const section: SectionWithProducts | null =
            await getPrismaClient().section.findFirst({
                where: {
                    id: sectionId,
                    isActive: true,
                },
                ...sectionWithProductsArgs,
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
            include: {
                sections: {
                    include: {
                        section: {
                            include: {
                                products: {
                                    include: {
                                        product: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            where: {
                id: categoryId,
                isActive: true,
            },
        });

        if (!category) {
            return null;
        }

        const productsMap = new Map<string, PublicProduct>();

        category.sections.forEach(({ section }) => {
            section.products.forEach((productSection) => {
                const product = mapProductSectionToPublicProduct(
                    productSection,
                    section.name,
                );
                if (!product) return;
                productsMap.set(product.id, product);
            });
        });

        return {
            id: category.id,
            name: category.name,
            products: [...productsMap.values()].sort((a, b) =>
                a.name.localeCompare(b.name),
            ),
        };
    } catch {
        return null;
    }
};
