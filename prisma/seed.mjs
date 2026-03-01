import { randomBytes, scryptSync } from "node:crypto";
import prismaClientPkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pgPkg from "pg";
import "dotenv/config";

const { PrismaClient } = prismaClientPkg;
const { Pool } = pgPkg;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("DATABASE_URL não definida para executar o seed.");
}

const pool = new Pool({
    connectionString: databaseUrl,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
    adapter,
});
const KEY_LENGTH = 64;

const hashPassword = (plainPassword) => {
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(plainPassword, salt, KEY_LENGTH).toString("hex");
    return `${salt}:${hash}`;
};

const getRequiredEnv = (key) => {
    const value = process.env[key]?.trim();
    if (!value) {
        throw new Error(`Variavel obrigatoria ausente: ${key}`);
    }

    return value;
};

const adminUser = {
    name: getRequiredEnv("SEED_ADMIN_NAME"),
    email: getRequiredEnv("SEED_ADMIN_EMAIL"),
    cpf: getRequiredEnv("SEED_ADMIN_CPF"),
    password: getRequiredEnv("SEED_ADMIN_PASSWORD"),
};

const storeConfig = {
    whatsappNumber: "5548999999999",
    email: "contato@spondias.com.br",
    address: "Endereço não configurado",
    companyName: "Spondias",
    cnpj: "00.000.000/0000-00",
};

const seedSections = [
    {
        id: "11111111-1111-4111-8111-111111111111",
        name: "Plantas de Sol Pleno",
        isActive: true,
        order: 1,
        isBanner: false,
        bannerImg: null,
        products: [
            {
                id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
                name: "Jiboia Limão",
                price: 4590,
                discountPercentage: 10,
                stock: 12,
                image: "/logo.jpg",
                isActive: true,
            },
            {
                id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2",
                name: "Zamioculca",
                price: 6990,
                discountPercentage: 0,
                stock: 7,
                image: "/logo.jpg",
                isActive: true,
            },
        ],
    },
    {
        id: "22222222-2222-4222-8222-222222222222",
        name: "Oferta da Semana",
        isActive: true,
        order: 2,
        isBanner: true,
        bannerImg: "/logo.jpg",
        products: [],
    },
    {
        id: "33333333-3333-4333-8333-333333333333",
        name: "Plantas para Vasos Suspensos",
        isActive: true,
        order: 3,
        isBanner: false,
        bannerImg: null,
        products: [
            {
                id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3",
                name: "Hera Inglesa",
                price: 3290,
                discountPercentage: 5,
                stock: 21,
                image: "/logo.jpg",
                isActive: true,
            },
            {
                id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4",
                name: "Colar de Pérolas",
                price: 5490,
                discountPercentage: 15,
                stock: 9,
                image: "/logo.jpg",
                isActive: true,
            },
        ],
    },
];

const seedCategories = [
    {
        id: "cccccccc-cccc-4ccc-8ccc-ccccccccccc1",
        name: "Sol Pleno",
        isActive: true,
        sectionIds: ["11111111-1111-4111-8111-111111111111"],
    },
    {
        id: "cccccccc-cccc-4ccc-8ccc-ccccccccccc2",
        name: "Ofertas",
        isActive: true,
        sectionIds: ["22222222-2222-4222-8222-222222222222"],
    },
    {
        id: "cccccccc-cccc-4ccc-8ccc-ccccccccccc3",
        name: "Vasos Suspensos",
        isActive: true,
        sectionIds: ["33333333-3333-4333-8333-333333333333"],
    },
];

const seed = async () => {
    const existingAdminByEmail = await prisma.user.findUnique({
        where: { email: adminUser.email },
        select: { id: true },
    });
    const existingAdminByCpf = await prisma.user.findUnique({
        where: { cpf: adminUser.cpf },
        select: { id: true },
    });

    if (!existingAdminByEmail && !existingAdminByCpf) {
        const passwordHash = hashPassword(adminUser.password);
        await prisma.user.create({
            data: {
                name: adminUser.name,
                email: adminUser.email,
                cpf: adminUser.cpf,
                passwordHash,
                isActive: true,
            },
        });
    }

    const storeConfigCount = await prisma.storeConfig.count();
    if (storeConfigCount === 0) {
        await prisma.storeConfig.create({
            data: storeConfig,
        });
    }

    const sectionIds = seedSections.map((section) => section.id);
    const existingSections = await prisma.section.findMany({
        where: { id: { in: sectionIds } },
        select: { id: true },
    });
    const existingSectionIds = new Set(existingSections.map((item) => item.id));
    const sectionsToCreate = seedSections
        .filter((section) => !existingSectionIds.has(section.id))
        .map((section) => ({
            id: section.id,
            name: section.name,
            isActive: section.isActive,
            order: section.order,
            isBanner: section.isBanner,
            bannerImg: section.bannerImg,
        }));

    if (sectionsToCreate.length > 0) {
        await prisma.section.createMany({
            data: sectionsToCreate,
            skipDuplicates: true,
        });
    }

    const seedProducts = seedSections.flatMap((section) => section.products);
    const productIds = seedProducts.map((product) => product.id);
    const existingProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true },
    });
    const existingProductIds = new Set(existingProducts.map((item) => item.id));
    const productsToCreate = seedProducts
        .filter((product) => !existingProductIds.has(product.id))
        .map((product) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            discountPercentage: product.discountPercentage,
            stock: product.stock,
            image: product.image,
            isActive: product.isActive,
        }));

    if (productsToCreate.length > 0) {
        await prisma.product.createMany({
            data: productsToCreate,
            skipDuplicates: true,
        });
    }

    const productSectionLinks = seedSections.flatMap((section) =>
        section.products.map((product) => ({
            sectionId: section.id,
            productId: product.id,
        })),
    );
    if (productSectionLinks.length > 0) {
        await prisma.productSection.createMany({
            data: productSectionLinks,
            skipDuplicates: true,
        });
    }

    const categoryIds = seedCategories.map((category) => category.id);
    const existingCategories = await prisma.category.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true },
    });
    const existingCategoryIds = new Set(
        existingCategories.map((item) => item.id),
    );
    const categoriesToCreate = seedCategories
        .filter((category) => !existingCategoryIds.has(category.id))
        .map((category) => ({
            id: category.id,
            name: category.name,
            isActive: category.isActive,
        }));

    if (categoriesToCreate.length > 0) {
        await prisma.category.createMany({
            data: categoriesToCreate,
            skipDuplicates: true,
        });
    }

    const sectionCategoryLinks = seedCategories.flatMap((category) =>
        category.sectionIds.map((sectionId) => ({
            sectionId,
            categoryId: category.id,
        })),
    );
    if (sectionCategoryLinks.length > 0) {
        await prisma.sectionCategory.createMany({
            data: sectionCategoryLinks,
            skipDuplicates: true,
        });
    }
};

seed()
    .then(async () => {
        await prisma.$disconnect();
        await pool.end();
    })
    .catch(async (error) => {
        console.error("Seed failed:", error);
        await prisma.$disconnect();
        await pool.end();
        process.exit(1);
    });
