import Link from "next/link";
import Image from "next/image";
import { ProductCard } from "@/src/components/public/product-card";
import type {
    PublicSection,
    PublicStoreConfig,
} from "@/src/server/public/public-content";

type HomeSectionsProps = {
    sections: PublicSection[];
    whatsappNumber: PublicStoreConfig["whatsappNumber"];
};

export function HomeSections({ sections, whatsappNumber }: HomeSectionsProps) {
    return (
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
                        <div className="flex max-h-[360px] overflow-scroll">
                            {section.products.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    whatsappNumber={whatsappNumber}
                                    className="mr-4 min-w-[250px]"
                                />
                            ))}
                        </div>
                    ) : null}
                </article>
            ))}
        </section>
    );
}
