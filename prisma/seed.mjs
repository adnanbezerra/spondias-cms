import { randomBytes, scryptSync } from "node:crypto";
import prismaClientPkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pgPkg from "pg";

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
const prisma = new PrismaClient({ adapter });
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

const catalogSectionId = "11111111-1111-4111-8111-111111111111";

const seedSections = [
    {
        id: catalogSectionId,
        name: "Linhas de produtos",
        isActive: true,
        order: 1,
        isBanner: false,
        bannerImg: null,
    },
];

const seedCategories = [
    { id: "cccccccc-cccc-4ccc-8ccc-cccccccccc01", name: "Linha RN", pricePerGram: 170, isActive: true, sectionIds: [catalogSectionId] },
    { id: "cccccccc-cccc-4ccc-8ccc-cccccccccc02", name: "Linha Infantil", pricePerGram: 170, isActive: true, sectionIds: [catalogSectionId] },
    { id: "cccccccc-cccc-4ccc-8ccc-cccccccccc03", name: "Linha Adulto", pricePerGram: 170, isActive: true, sectionIds: [catalogSectionId] },
    { id: "cccccccc-cccc-4ccc-8ccc-cccccccccc04", name: "Dores Articulares", pricePerGram: 200, isActive: true, sectionIds: [catalogSectionId] },
    { id: "cccccccc-cccc-4ccc-8ccc-cccccccccc05", name: "Especial", pricePerGram: 130, isActive: true, sectionIds: [catalogSectionId] },
    { id: "cccccccc-cccc-4ccc-8ccc-cccccccccc06", name: "Linha Gestante/Lactante", pricePerGram: 170, isActive: true, sectionIds: [catalogSectionId] },
    { id: "cccccccc-cccc-4ccc-8ccc-cccccccccc07", name: "Linha Infantil Premium", pricePerGram: 200, isActive: true, sectionIds: [catalogSectionId] },
    { id: "cccccccc-cccc-4ccc-8ccc-cccccccccc08", name: "Linha Adulto Premium", pricePerGram: 200, isActive: true, sectionIds: [catalogSectionId] },
    { id: "cccccccc-cccc-4ccc-8ccc-cccccccccc09", name: "Linha Gestante/Lactante Premium", pricePerGram: 200, isActive: true, sectionIds: [catalogSectionId] },
];

const seedProducts = [
    { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01", name: "Hidrapele RN", description: "Hidrapele RN.", stock: 40, discountPercentage: 0, image: "/logo.jpg", isActive: true, categoryId: "cccccccc-cccc-4ccc-8ccc-cccccccccc01" },

    { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02", name: "Hidrapele infantil com ação de prevenção e tratamento de assaduras", description: "Hidrapele infantil com ação de prevenção e tratamento de assaduras.", stock: 35, discountPercentage: 0, image: "/logo.jpg", isActive: true, categoryId: "cccccccc-cccc-4ccc-8ccc-cccccccccc02" },
    { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa03", name: "Hidrapele infantil com ação repelente", description: "Hidrapele infantil com ação repelente.", stock: 35, discountPercentage: 0, image: "/logo.jpg", isActive: true, categoryId: "cccccccc-cccc-4ccc-8ccc-cccccccccc02" },
    { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa04", name: "Desodorante infantil", description: "Desodorante infantil.", stock: 28, discountPercentage: 0, image: "/logo.jpg", isActive: true, categoryId: "cccccccc-cccc-4ccc-8ccc-cccccccccc07" },

    { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa05", name: "Hidrapele adulto", description: "Hidrapele adulto.", stock: 30, discountPercentage: 0, image: "/logo.jpg", isActive: true, categoryId: "cccccccc-cccc-4ccc-8ccc-cccccccccc03" },
    { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa06", name: "Hidrapele adulto com ação repelente", description: "Hidrapele adulto com ação repelente.", stock: 30, discountPercentage: 0, image: "/logo.jpg", isActive: true, categoryId: "cccccccc-cccc-4ccc-8ccc-cccccccccc03" },
    { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa07", name: "Desodorante adulto masculino e feminino", description: "Desodorante adulto, masculino e feminino.", stock: 26, discountPercentage: 0, image: "/logo.jpg", isActive: true, categoryId: "cccccccc-cccc-4ccc-8ccc-cccccccccc08" },

    { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa08", name: "Creme para dores articulares", description: "Creme para dores articulares.", stock: 22, discountPercentage: 0, image: "/logo.jpg", isActive: true, categoryId: "cccccccc-cccc-4ccc-8ccc-cccccccccc04" },

    { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa09", name: "Hidrapele especial para dermatite", description: "Hidrapele especial para dermatite.", stock: 18, discountPercentage: 0, image: "/logo.jpg", isActive: true, categoryId: "cccccccc-cccc-4ccc-8ccc-cccccccccc05" },

    { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa10", name: "Hidrapele gestante lactante", description: "Hidrapele gestante lactante.", stock: 24, discountPercentage: 0, image: "/logo.jpg", isActive: true, categoryId: "cccccccc-cccc-4ccc-8ccc-cccccccccc06" },
    { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11", name: "Hidrapele com ação repelente gestante lactante", description: "Hidrapele com ação repelente, gestante lactante.", stock: 24, discountPercentage: 0, image: "/logo.jpg", isActive: true, categoryId: "cccccccc-cccc-4ccc-8ccc-cccccccccc06" },
    { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa12", name: "Desodorante gestante lactante", description: "Desodorante gestante lactante.", stock: 20, discountPercentage: 0, image: "/logo.jpg", isActive: true, categoryId: "cccccccc-cccc-4ccc-8ccc-cccccccccc09" },
];

const seed = async () => {
    const existingAdminByEmail = await prisma.user.findUnique({ where: { email: adminUser.email }, select: { id: true } });
    const existingAdminByCpf = await prisma.user.findUnique({ where: { cpf: adminUser.cpf }, select: { id: true } });

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
        await prisma.storeConfig.create({ data: storeConfig });
    }

    await prisma.section.createMany({ data: seedSections, skipDuplicates: true });

    await prisma.category.createMany({
        data: seedCategories.map((category) => ({
            id: category.id,
            name: category.name,
            pricePerGram: category.pricePerGram,
            isActive: category.isActive,
        })),
        skipDuplicates: true,
    });

    await prisma.product.createMany({
        data: seedProducts.map((product) => ({
            id: product.id,
            name: product.name,
            description: product.description,
            price: 0,
            stock: product.stock,
            discountPercentage: product.discountPercentage,
            image: product.image,
            isActive: product.isActive,
        })),
        skipDuplicates: true,
    });

    const sectionCategoryLinks = seedCategories.flatMap((category) =>
        category.sectionIds.map((sectionId) => ({ sectionId, categoryId: category.id })),
    );
    await prisma.sectionCategory.createMany({ data: sectionCategoryLinks, skipDuplicates: true });

    const productCategoryLinks = seedProducts.map((product) => ({
        productId: product.id,
        categoryId: product.categoryId,
    }));
    await prisma.productCategory.createMany({ data: productCategoryLinks, skipDuplicates: true });
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
