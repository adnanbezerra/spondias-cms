import Image from "next/image";
import type {
    PublicCategory,
    PublicStoreConfig,
} from "@/src/server/public/public-content";
import { buildWhatsAppUrl } from "@/src/server/public/public-content";

type HomeHeroProps = {
    config: PublicStoreConfig;
    categories: PublicCategory[];
};

export function HomeHero({ config, categories }: HomeHeroProps) {
    return (
        <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr,0.8fr] md:py-14">
            <div className="space-y-5">
                <p className="w-fit rounded-full border border-[#334D40]/20 bg-white/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.15em]">
                    Loja de plantas
                </p>
                <h1 className="text-4xl leading-tight font-semibold [font-family:var(--font-title)] sm:text-5xl">
                    Plantas para transformar a sua casa, jardim e varanda.
                </h1>
                <p className="max-w-xl text-[#334D40]/85">
                    Catálogo online com atendimento direto no WhatsApp. Escolha a
                    planta ideal e finalize com a nossa equipe em poucos minutos.
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
                    <div className="rounded-xl border border-[#334D40]/20 p-3">
                        <p className="text-xs uppercase tracking-[0.12em]">
                            Categorias
                        </p>
                        <p className="text-2xl font-semibold">
                            {categories.length}
                        </p>
                    </div>
                    <div className="rounded-xl bg-[#334D40] p-3 text-[#DBD7CB]">
                        <a
                            href={buildWhatsAppUrl(
                                config.whatsappNumber,
                                "Olá, vim pelo site e quero atendimento.",
                            )}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <p className="text-xs uppercase tracking-[0.12em]">
                                Contato
                            </p>
                            <p className="text-sm font-semibold">
                                Fale conosco no WhatsApp!
                            </p>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
