import Link from "next/link";

type DashboardStatCardProps = {
    title: string;
    href: string;
    count: number;
    subtitle: string;
};

export const DashboardStatCard = ({
    title,
    href,
    count,
    subtitle,
}: DashboardStatCardProps) => {
    return (
        <article className="rounded-2xl border border-[#334D40]/15 bg-white/85 p-5">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold [font-family:var(--font-title)]">
                    {title}
                </h2>
                <Link
                    href={href}
                    className="text-xs font-semibold uppercase tracking-[0.1em] text-[#334D40]/70"
                >
                    gerenciar
                </Link>
            </div>
            <p className="mt-3 text-3xl font-semibold">{count}</p>
            <p className="mt-1 text-xs text-[#334D40]/75">{subtitle}</p>
        </article>
    );
};
