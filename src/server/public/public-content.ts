import { getPrismaClient } from "@/src/server/db/prisma";
import type { Prisma } from "@prisma/client";
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

const defaultConfig: PublicStoreConfig = {
    whatsappNumber: "5548999999999",
    email: "contato@spondias.com.br",
    address: "Endereço não configurado",
    companyName: "Spondias",
    cnpj: "00.000.000/0000-00",
};

const fallbackSections: PublicSection[] = [
    {
        id: "section-sol-pleno",
        name: "Plantas de Sol Pleno",
        description:
            "Espécies resistentes para áreas externas com alta incidência solar.",
        isBanner: false,
        bannerImage: null,
        products: [
            {
                id: "product-jiboia-limao",
                name: "Jiboia Limão",
                description: "Folhagem ornamental de fácil cuidado.",
                priceInCents: 4590,
                discountPercentage: 10,
                stock: 12,
                image: "/logo.jpg",
            },
            {
                id: "product-zamioculca",
                name: "Zamioculca",
                description: "Ideal para iniciantes e ambientes internos.",
                priceInCents: 6990,
                discountPercentage: 0,
                stock: 7,
                image: "/logo.jpg",
            },
        ],
    },
    {
        id: "section-banner",
        name: "Oferta da Semana",
        description: "Aproveite descontos especiais em plantas selecionadas.",
        isBanner: true,
        bannerImage: "/logo.jpg",
        products: [],
    },
    {
        id: "section-pendentes",
        name: "Plantas para Vasos Suspensos",
        description: "Seção para espécies pendentes e decoração vertical.",
        isBanner: false,
        bannerImage: null,
        products: [
            {
                id: "product-hera-inglesa",
                name: "Hera Inglesa",
                description:
                    "Crescimento vigoroso para jardineiras e suportes.",
                priceInCents: 3290,
                discountPercentage: 5,
                stock: 21,
                image: "/logo.jpg",
            },
            {
                id: "product-colar-de-perolas",
                name: "Colar de Pérolas",
                description: "Visual delicado para ambientes bem iluminados.",
                priceInCents: 5490,
                discountPercentage: 15,
                stock: 9,
                image: "/logo.jpg",
            },
        ],
    },
];

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
            whatsappNumber:
                result.value.whatsappNumber || defaultConfig.whatsappNumber,
            email: result.value.email || defaultConfig.email,
            address: result.value.address || defaultConfig.address,
            companyName: result.value.companyName || defaultConfig.companyName,
            cnpj: result.value.cnpj || defaultConfig.cnpj,
        };
    } catch {
        return defaultConfig;
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
        // Fall back below when DB is not ready.
    }

    const fallback = await getHomeSections();
    return fallback.flatMap((section) => section.products);
};

export const getHomeSections = async (): Promise<PublicSection[]> => {
    try {
        const sections: SectionWithProducts[] =
            await getPrismaClient().section.findMany({
                where: { isActive: true },
                ...sectionWithProductsArgs,
                orderBy: [{ order: "asc" }, { name: "asc" }],
            });

        if (sections.length === 0) {
            return fallbackSections;
        }

        return sections.map((section) => mapSectionToPublicSection(section));
    } catch {
        return fallbackSections;
    }
};

export const getSectionById = async (
    sectionId: string,
): Promise<PublicSection | null> => {
    try {
        const section: SectionWithProducts | null =
            await getPrismaClient().section.findUnique({
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
        const category = await getPrismaClient().category.findUnique({
            where: { isActive: true },
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
