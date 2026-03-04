"use client";

import { useMemo, useState } from "react";
import type { AdminCategory, AdminProduct } from "@/src/components/admin/admin-api";

type DashboardRecentCategoriesTableProps = {
    categories: AdminCategory[];
    products: AdminProduct[];
};

type CategoryRow = {
    id: string;
    name: string;
    productCount: number;
    updatedAt: Date | null;
    isActive: boolean;
};

const ITEMS_PER_PAGE = 5;

function formatUpdatedAt(date: Date | null) {
    if (!date) return "Sem atualização";

    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(date);
}

export function DashboardRecentCategoriesTable({
    categories,
    products,
}: DashboardRecentCategoriesTableProps) {
    const [page, setPage] = useState(1);

    const rows = useMemo<CategoryRow[]>(() => {
        return categories
            .map((category) => {
                const productCount = products.filter((product) =>
                    product.categoryIds.includes(category.id),
                ).length;

                return {
                    id: category.id,
                    name: category.name,
                    productCount,
                    updatedAt: category.updatedAt
                        ? new Date(category.updatedAt)
                        : null,
                    isActive: category.isActive,
                };
            })
            .sort((a, b) => {
                if (!a.updatedAt && !b.updatedAt) return 0;
                if (!a.updatedAt) return 1;
                if (!b.updatedAt) return -1;
                return b.updatedAt.getTime() - a.updatedAt.getTime();
            });
    }, [categories, products]);

    const totalPages = Math.max(1, Math.ceil(rows.length / ITEMS_PER_PAGE));
    const safePage = Math.min(page, totalPages);
    const paginatedRows = rows.slice(
        (safePage - 1) * ITEMS_PER_PAGE,
        safePage * ITEMS_PER_PAGE,
    );

    const onPreviousPage = () => {
        setPage((current) => Math.max(1, Math.min(totalPages, current - 1)));
    };

    const onNextPage = () => {
        setPage((current) => Math.max(1, Math.min(totalPages, current + 1)));
    };

    return (
        <section className="mt-8 overflow-hidden rounded-2xl border border-[#334D40]/15 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#334D40]/10 px-5 py-4">
                <h2 className="text-xl font-semibold [font-family:var(--font-title)]">
                    Categorias recentes
                </h2>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#334D40]/65">
                    {rows.length} categorias
                </span>
            </div>

            {rows.length === 0 ? (
                <p className="px-5 py-6 text-sm text-[#334D40]/80">
                    Nenhuma categoria cadastrada ainda.
                </p>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-[#DBD7CB]/30 text-xs uppercase tracking-[0.12em] text-[#334D40]/75">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Nome da categoria</th>
                                    <th className="px-5 py-3 font-semibold">Total de produtos</th>
                                    <th className="px-5 py-3 font-semibold">Última atualização</th>
                                    <th className="px-5 py-3 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#334D40]/10">
                                {paginatedRows.map((row) => (
                                    <tr key={row.id} className="bg-white">
                                        <td className="px-5 py-3 font-medium">{row.name}</td>
                                        <td className="px-5 py-3 text-[#334D40]/85">
                                            {row.productCount} item
                                            {row.productCount === 1 ? "" : "s"}
                                        </td>
                                        <td className="px-5 py-3 text-[#334D40]/85">
                                            {formatUpdatedAt(row.updatedAt)}
                                        </td>
                                        <td className="px-5 py-3">
                                            <span
                                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                                    row.isActive
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-slate-100 text-slate-700"
                                                }`}
                                            >
                                                {row.isActive ? "Ativa" : "Inativa"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#334D40]/10 px-5 py-3">
                        <p className="text-xs text-[#334D40]/70">
                            Página {safePage} de {totalPages}
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onPreviousPage}
                                disabled={safePage === 1}
                                className="rounded-lg border border-[#334D40]/20 px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Anterior
                            </button>
                            <button
                                type="button"
                                onClick={onNextPage}
                                disabled={safePage === totalPages}
                                className="rounded-lg border border-[#334D40]/20 px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Próxima
                            </button>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}
