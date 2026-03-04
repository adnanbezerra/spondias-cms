import { DashboardStatCard } from "@/src/components/admin/dashboard/dashboard-stat-card";

type DashboardStatsGridProps = {
    productCount: number;
    categoryCount: number;
    activeSectionsCount: number;
};

export function DashboardStatsGrid({
    productCount,
    categoryCount,
    activeSectionsCount,
}: DashboardStatsGridProps) {
    return (
        <section className="mt-8 grid gap-4 lg:grid-cols-3">
            <DashboardStatCard
                title="Produtos"
                href="/admin/products"
                count={productCount}
                subtitle="produtos cadastrados"
            />
            <DashboardStatCard
                title="Categorias"
                href="/admin/categories"
                count={categoryCount}
                subtitle="categorias cadastradas"
            />
            <DashboardStatCard
                title="Seções"
                href="/admin/sections"
                count={activeSectionsCount}
                subtitle="seções ativas na vitrine"
            />
        </section>
    );
}
