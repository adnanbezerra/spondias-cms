import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/src/components/public/product-card";
import { SiteFooter } from "@/src/components/public/site-footer";
import { SiteHeader } from "@/src/components/public/site-header";
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
        <main className="min-h-screen text-[#334D40]">
            <SiteHeader categories={categories} />

            <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
                <p className="text-sm uppercase tracking-[0.14em] text-[#334D40]/70">
                    Seção
                </p>
                <h1 className="mt-2 text-4xl font-semibold [font-family:var(--font-title)]">
                    {section.name}
                </h1>
                <p className="mt-3 max-w-2xl text-sm text-[#334D40]/80">
                    {section.description}
                </p>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
                {section.products.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {section.products.map((product) => (
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
                            Ainda não há produtos vinculados a esta seção.
                        </p>
                    </div>
                )}
            </section>

            <SiteFooter config={config} />
        </main>
    );
}
