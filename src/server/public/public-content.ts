import { CategoryService } from "@/src/server/services/category-service";
import { StoreConfigService } from "@/src/server/services/store-config-service";

const categoryService = new CategoryService();
const storeConfigService = new StoreConfigService();

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
    description: "Espécies resistentes para áreas externas com alta incidência solar.",
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
        description: "Crescimento vigoroso para jardineiras e suportes.",
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
      whatsappNumber: result.value.whatsappNumber || defaultConfig.whatsappNumber,
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

export const getHomeSections = async (): Promise<PublicSection[]> => fallbackSections;

export const getCategoryProducts = async (
  categoryId: string,
): Promise<PublicProduct[]> => {
  const sections = await getHomeSections();
  const products = sections.flatMap((section) => section.products);
  if (products.length === 0) return [];

  const categories = await getPublicCategories();
  if (categories.length === 0) return products;

  const orderedProducts = [...products].sort((a, b) => a.name.localeCompare(b.name));
  const groupedByCategory = new Map<string, PublicProduct[]>();

  for (const category of categories) {
    groupedByCategory.set(category.id, []);
  }

  orderedProducts.forEach((product, index) => {
    const category = categories[index % categories.length];
    groupedByCategory.get(category.id)?.push(product);
  });

  return groupedByCategory.get(categoryId) ?? [];
};
