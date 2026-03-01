import Link from "next/link";
import type { PublicStoreConfig } from "@/src/server/public/public-content";

type SiteFooterProps = {
    config: PublicStoreConfig;
};

export const SiteFooter = ({ config }: SiteFooterProps) => {
    return (
        <footer className="border-t border-[#334D40]/15 bg-[#334D40] text-[#DBD7CB]">
            <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-10 sm:px-6 md:grid-cols-2">
                <div>
                    <h3 className="text-xl font-semibold [font-family:var(--font-title)]">
                        {config.companyName}
                    </h3>
                    <p className="mt-3 text-sm text-[#DBD7CB]/85">
                        {config.address}
                    </p>
                </div>

                <div className="space-y-2 text-sm">
                    <p>
                        <span className="font-semibold">Email:</span>{" "}
                        {config.email}
                    </p>
                    <p>
                        <span className="font-semibold">WhatsApp:</span>{" "}
                        {config.whatsappNumber}
                    </p>
                    <p>
                        <span className="font-semibold">CNPJ:</span>{" "}
                        {config.cnpj}
                    </p>
                    <Link
                        href="/admin"
                        className="inline-block rounded-full border border-[#DBD7CB]/35 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] transition hover:bg-[#DBD7CB] hover:text-[#334D40]"
                    >
                        Área administrativa
                    </Link>
                </div>
            </div>
        </footer>
    );
};
