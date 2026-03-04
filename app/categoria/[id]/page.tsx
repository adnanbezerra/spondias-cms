import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductsCatalogPage } from "@/src/components/public/catalog/products-catalog-view";
import {
    getCategoryProducts,
    getPublicCategories,
    getPublicStoreConfig,
} from "@/src/server/public/public-content";

type CategoryPageProps = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({
    params,
}: CategoryPageProps): Promise<Metadata> {
    const { id } = await params;
    const categories = await getPublicCategories();
    const category = categories.find((item) => item.id === id);

    return {
        title: category ? `${category.name} | Spondias` : "Categoria | Spondias",
    };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { id } = await params;
    const [config, categories, products] = await Promise.all([
        getPublicStoreConfig(),
        getPublicCategories(),
        getCategoryProducts(id),
    ]);

    const category = categories.find((item) => item.id === id);
    if (!category) {
        notFound();
    }

    return (
        <ProductsCatalogPage
            categories={categories}
            config={config}
            label="Categoria"
            title={category.name}
            description="Produtos destacados para esta categoria. Clique em comprar para continuar o atendimento direto no WhatsApp."
            products={products}
            emptyMessage="Ainda não há produtos vinculados a esta categoria."
        />
    );
}
