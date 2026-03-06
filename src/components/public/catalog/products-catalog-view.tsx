import { ProductsCatalogClient } from "@/src/components/public/catalog/products-catalog-client";
import { SiteFooter } from "@/src/components/public/site-footer";
import { SiteHeader } from "@/src/components/public/site-header";
import type {
    PublicCategory,
    PublicProduct,
    PublicStoreConfig,
} from "@/src/server/public/public-content";

type ProductsCatalogPageProps = {
    categories: PublicCategory[];
    config: PublicStoreConfig;
    label: string;
    title: string;
    description: string;
    products: PublicProduct[];
    emptyMessage: string;
};

export function ProductsCatalogPage({
    categories,
    config,
    label,
    title,
    description,
    products,
    emptyMessage,
}: ProductsCatalogPageProps) {
    return (
        <main className="min-h-screen text-[#334D40]">
            <SiteHeader categories={categories} />

            <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
                <p className="text-sm uppercase tracking-[0.14em] text-[#334D40]/70">
                    {label}
                </p>
                <h1 className="mt-2 text-4xl font-semibold [font-family:var(--font-title)]">
                    {title}
                </h1>
                <p className="mt-3 max-w-2xl text-sm text-[#334D40]/80">
                    {description}
                </p>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
                {products.length > 0 ? (
                    <ProductsCatalogClient products={products} />
                ) : (
                    <div className="rounded-2xl border border-[#334D40]/15 bg-white/70 p-6">
                        <p className="text-sm text-[#334D40]/80">
                            {emptyMessage}
                        </p>
                    </div>
                )}
            </section>

            <SiteFooter config={config} />
        </main>
    );
}
