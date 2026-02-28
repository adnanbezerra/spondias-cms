import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/src/components/public/product-card";
import { SiteFooter } from "@/src/components/public/site-footer";
import { SiteHeader } from "@/src/components/public/site-header";
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
        title: category
            ? `${category.name} | Spondias`
            : "Categoria | Spondias",
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
        <main className="min-h-screen text-[#334D40]">
            <SiteHeader categories={categories} />

            <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
                <p className="text-sm uppercase tracking-[0.14em] text-[#334D40]/70">
                    Categoria
                </p>
                <h1 className="mt-2 text-4xl font-semibold [font-family:var(--font-title)]">
                    {category.name}
                </h1>
                <p className="mt-3 max-w-2xl text-sm text-[#334D40]/80">
                    Produtos destacados para esta categoria. Clique em comprar
                    para continuar o atendimento direto no WhatsApp.
                </p>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
                {products.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                whatsappNumber={config.whatsappNumber}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-[#334D40]/15 bg-white/70 p-6">
                        <p className="text-sm text-[#334D40]/80">
                            Ainda não há produtos vinculados a esta categoria.
                        </p>
                    </div>
                )}
            </section>

            <SiteFooter config={config} />
        </main>
    );
}
