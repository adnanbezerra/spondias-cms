import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductsCatalogPage } from "@/src/components/public/catalog/products-catalog-view";
import {
    getPublicCategories,
    getPublicStoreConfig,
    getSectionById,
} from "@/src/server/public/public-content";

type SectionPageProps = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({
    params,
}: SectionPageProps): Promise<Metadata> {
    const { id } = await params;
    const section = await getSectionById(id);

    return {
        title: section ? `${section.name} | Spondias` : "Seção | Spondias",
    };
}

export default async function SectionPage({ params }: SectionPageProps) {
    const { id } = await params;
    const [config, categories, section] = await Promise.all([
        getPublicStoreConfig(),
        getPublicCategories(),
        getSectionById(id),
    ]);

    if (!section) {
        notFound();
    }

    return (
        <ProductsCatalogPage
            categories={categories}
            config={config}
            label="Seção"
            title={section.name}
            description={section.description}
            products={section.products}
            emptyMessage="Ainda não há produtos vinculados a esta seção."
        />
    );
}
