"use client";

import type { AdminCategory } from "@/src/components/admin/admin-api";

type CategoriesListProps = {
    categories: AdminCategory[];
    onEditCategory: (categoryId: string) => void;
    onDeleteCategory: (categoryId: string) => void;
};

export function CategoriesList({
    categories,
    onEditCategory,
    onDeleteCategory,
}: CategoriesListProps) {
    if (categories.length === 0) {
        return (
            <p className="text-sm text-[#334D40]/80">
                Nenhuma categoria cadastrada.
            </p>
        );
    }

    return (
        <>
            {categories.map((category) => (
                <article
                    key={category.id}
                    className="rounded-xl border border-[#334D40]/15 bg-white p-3"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="font-semibold">{category.name}</p>
                            <p className="text-xs text-[#334D40]/75">
                                Preço por grama: R$ {(category.pricePerGram / 100).toFixed(2).replace(".", ",")} · {category.isActive ? "Ativa" : "Inativa"}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => onEditCategory(category.id)}
                                className="rounded-lg border border-[#334D40]/20 px-2 py-1 text-xs"
                            >
                                Editar
                            </button>
                            <button
                                type="button"
                                onClick={() => onDeleteCategory(category.id)}
                                className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700"
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </article>
            ))}
        </>
    );
}
