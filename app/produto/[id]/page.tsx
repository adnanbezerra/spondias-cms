import { notFound } from "next/navigation";
import { SiteFooter } from "@/src/components/public/site-footer";
import { SiteHeader } from "@/src/components/public/site-header";
import { ProductViewContent } from "@/src/components/public/product-view-dialog";
import {
    getPublicCategories,
    getPublicProductDetailsById,
    getPublicStoreConfig,
} from "@/src/server/public/public-content";

type ProductPageProps = {
    params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = await params;

    const [config, categories, details] = await Promise.all([
        getPublicStoreConfig(),
        getPublicCategories(),
        getPublicProductDetailsById(id),
    ]);

    if (!details) {
        notFound();
    }

    return (
        <main className="min-h-screen text-[#334D40]">
            <SiteHeader categories={categories} />
            <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
                <ProductViewContent
                    details={details}
                    shareUrl={`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/produto/${details.product.id}`}
                />
            </section>
            <SiteFooter config={config} />
        </main>
    );
}
