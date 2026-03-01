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
const prisma = new PrismaClient({
    adapter,
});
const KEY_LENGTH = 64;

const hashPassword = (plainPassword) => {
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(plainPassword, salt, KEY_LENGTH).toString("hex");
    return `${salt}:${hash}`;
};

const adminUser = {
    name: "Adnan",
    email: "adnanbezerra@proton.me",
    cpf: "00000000000",
    password: "ykZhPYY&0H%DTTNB0GRtmzrFE&zP8x",
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
    const existingAdmin = await prisma.user.findFirst({
        where: {
            OR: [{ email: adminUser.email }, { cpf: adminUser.cpf }],
        },
        select: { id: true },
    });

    const passwordHash = hashPassword(adminUser.password);

    if (existingAdmin) {
        await prisma.user.update({
            where: { id: existingAdmin.id },
            data: {
                name: adminUser.name,
                email: adminUser.email,
                cpf: adminUser.cpf,
                passwordHash,
                isActive: true,
            },
        });
    } else {
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

    const existingStoreConfig = await prisma.storeConfig.findFirst({
        orderBy: { updatedAt: "desc" },
        select: { id: true },
    });

    if (existingStoreConfig) {
        await prisma.storeConfig.update({
            where: { id: existingStoreConfig.id },
            data: storeConfig,
        });
    } else {
        await prisma.storeConfig.create({
            data: storeConfig,
        });
    }

    const links = [];

    for (const section of seedSections) {
        await prisma.section.upsert({
            where: { id: section.id },
            update: {
                name: section.name,
                isActive: section.isActive,
                order: section.order,
                isBanner: section.isBanner,
                bannerImg: section.bannerImg,
            },
            create: {
                id: section.id,
                name: section.name,
                isActive: section.isActive,
                order: section.order,
                isBanner: section.isBanner,
                bannerImg: section.bannerImg,
            },
        });

        for (const product of section.products) {
            await prisma.product.upsert({
                where: { id: product.id },
                update: {
                    name: product.name,
                    price: product.price,
                    discountPercentage: product.discountPercentage,
                    stock: product.stock,
                    image: product.image,
                    isActive: product.isActive,
                },
                create: {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    discountPercentage: product.discountPercentage,
                    stock: product.stock,
                    image: product.image,
                    isActive: product.isActive,
                },
            });

            links.push({
                sectionId: section.id,
                productId: product.id,
            });
        }
    }

    await prisma.productSection.deleteMany({
        where: {
            OR: [
                { sectionId: { in: seedSections.map((section) => section.id) } },
                {
                    productId: {
                        in: seedSections.flatMap((section) =>
                            section.products.map((product) => product.id),
                        ),
                    },
                },
            ],
        },
    });

    if (links.length > 0) {
        await prisma.productSection.createMany({
            data: links,
            skipDuplicates: true,
        });
    }

    const sectionCategoryLinks = [];

    for (const category of seedCategories) {
        await prisma.category.upsert({
            where: { id: category.id },
            update: {
                name: category.name,
                isActive: category.isActive,
            },
            create: {
                id: category.id,
                name: category.name,
                isActive: category.isActive,
            },
        });

        for (const sectionId of category.sectionIds) {
            sectionCategoryLinks.push({
                sectionId,
                categoryId: category.id,
            });
        }
    }

    await prisma.sectionCategory.deleteMany({
        where: {
            OR: [
                { sectionId: { in: seedSections.map((section) => section.id) } },
                { categoryId: { in: seedCategories.map((category) => category.id) } },
            ],
        },
    });

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
