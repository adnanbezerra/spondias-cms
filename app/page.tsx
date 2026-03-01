import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/src/components/public/product-card";
import { SiteFooter } from "@/src/components/public/site-footer";
import { SiteHeader } from "@/src/components/public/site-header";
import {
    getHomeSections,
    getPublicCategories,
    getPublicStoreConfig,
} from "@/src/server/public/public-content";

export default async function Home() {
    const [config, categories, sections] = await Promise.all([
        getPublicStoreConfig(),
        getPublicCategories(),
        getHomeSections(),
    ]);

    return (
        <main className="min-h-screen text-[#334D40]">
            <SiteHeader categories={categories} />

            <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr,0.8fr] md:py-14">
                <div className="space-y-5">
                    <p className="w-fit rounded-full border border-[#334D40]/20 bg-white/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.15em]">
                        Loja de plantas
                    </p>
                    <h1 className="text-4xl leading-tight font-semibold [font-family:var(--font-title)] sm:text-5xl">
                        Plantas para transformar a sua casa, jardim e varanda.
                    </h1>
                    <p className="max-w-xl text-[#334D40]/85">
                        Catálogo online com atendimento direto no WhatsApp.
                        Escolha a planta ideal e finalize com a nossa equipe em
                        poucos minutos.
                    </p>
                </div>

                <div className="rounded-3xl border border-[#334D40]/15 bg-white/70 p-4 shadow-sm">
                    <Image
                        src="/logo.jpg"
                        alt="Logo da Spondias"
                        width={560}
                        height={360}
                        className="h-60 w-full rounded-2xl object-cover"
                        priority
                    />
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-[#334D40] p-3 text-[#DBD7CB]">
                            <p className="text-xs uppercase tracking-[0.12em]">
                                Categorias
                            </p>
                            <p className="text-2xl font-semibold">
                                {categories.length}
                            </p>
                        </div>
                        <div className="rounded-xl border border-[#334D40]/20 bg-white p-3">
                            <p className="text-xs uppercase tracking-[0.12em]">
                                Contato
                            </p>
                            <p className="text-sm font-semibold">
                                WhatsApp direto
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl space-y-8 px-4 pb-16 sm:px-6">
                {sections.map((section) => (
                    <article key={section.id} className="space-y-4">
                        <header className="space-y-2">
                            <h2 className="text-3xl font-semibold [font-family:var(--font-title)]">
                                <Link
                                    href={`/secao/${section.id}`}
                                    className="hover:underline"
                                >
                                    {section.name}
                                </Link>
                            </h2>
                            <p className="text-sm text-[#334D40]/80">
                                {section.description}
                            </p>
                        </header>

                        {section.isBanner ? (
                            <div className="overflow-hidden rounded-3xl border border-[#334D40]/15 bg-white/70 p-3 shadow-sm">
                                <Image
                                    src={section.bannerImage ?? "/logo.jpg"}
                                    alt={section.name}
                                    width={1200}
                                    height={320}
                                    className="h-52 w-full rounded-2xl object-cover sm:h-64"
                                />
                            </div>
                        ) : null}

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
                        ) : null}
                    </article>
                ))}
            </section>

            <SiteFooter config={config} />
        </main>
    );
}
