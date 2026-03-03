"use client";

import { useEffect, useState } from "react";
import { AdminSidebar } from "@/src/components/admin/admin-sidebar";
import { useAdminToast } from "@/src/components/admin/admin-toast";
import {
    fetchJson,
    type AdminCategory,
} from "@/src/components/admin/admin-api";

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<AdminCategory[]>([]);
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
        null,
    );
    const [name, setName] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { showToast } = useAdminToast();

    const loadData = async () => {
        const payload = await fetchJson<AdminCategory[]>(
            "/api/admin/categories",
        );
        setCategories(payload);
    };

    useEffect(() => {
        loadData().catch(() => {
            setErrorMessage("Falha ao carregar categorias.");
            showToast("Falha ao carregar categorias.", { variant: "error" });
        });
    }, [showToast]);

    const resetForm = () => {
        setEditingCategoryId(null);
        setName("");
        setIsActive(true);
    };

    const onEditCategory = async (categoryId: string) => {
        setErrorMessage(null);

        try {
            const category = await fetchJson<AdminCategory>(
                `/api/admin/categories/${categoryId}`,
            );
            setEditingCategoryId(category.id);
            setName(category.name);
            setIsActive(category.isActive);
        } catch (error) {
            showToast("Falha ao carregar categoria para edição.", {
                variant: "error",
            });
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Falha ao carregar categoria.",
            );
        }
    };

    const onSubmitCategory = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();
        setErrorMessage(null);
        setIsSubmitting(true);

        try {
            const payload = { name, isActive };
            if (editingCategoryId) {
                await fetchJson<AdminCategory>(
                    `/api/admin/categories/${editingCategoryId}`,
                    {
                        method: "PATCH",
                        body: JSON.stringify(payload),
                    },
                );
                showToast("Categoria atualizada com sucesso.", {
                    variant: "success",
                });
            } else {
                await fetchJson<AdminCategory>("/api/admin/categories", {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
                showToast("Categoria criada com sucesso.", {
                    variant: "success",
                });
            }

            resetForm();
            await loadData();
        } catch (error) {
            showToast("Falha ao salvar categoria.", { variant: "error" });
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Falha ao salvar categoria.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const onDeleteCategory = async (categoryId: string) => {
        const approved = window.confirm(
            "Deseja realmente excluir esta categoria?",
        );
        if (!approved) return;

        try {
            await fetchJson<{ deleted: true }>(
                `/api/admin/categories/${categoryId}`,
                {
                    method: "DELETE",
                },
            );
            showToast("Categoria excluída com sucesso.", {
                variant: "success",
            });

            if (editingCategoryId === categoryId) {
                resetForm();
            }
            await loadData();
        } catch (error) {
            showToast("Falha ao excluir categoria.", { variant: "error" });
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Falha ao excluir categoria.",
            );
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F4EF] text-[#334D40]">
            <AdminSidebar />
            <main className="px-4 py-6 sm:px-6 lg:ml-72 lg:px-10 lg:py-10">
                <header className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#334D40]/65">
                        Catálogo
                    </p>
                    <h1 className="mt-1 text-4xl font-semibold [font-family:var(--font-title)]">
                        Categorias
                    </h1>
                </header>
                <section className="grid gap-6 lg:grid-cols-[1fr,1.2fr]">
                    <form
                        onSubmit={onSubmitCategory}
                        className="space-y-4 rounded-2xl border border-[#334D40]/15 bg-white p-5 shadow-sm"
                    >
                        <h2 className="text-2xl font-semibold [font-family:var(--font-title)]">
                            {editingCategoryId
                                ? "Editar categoria"
                                : "Nova categoria"}
                        </h2>

                        <div className="space-y-1">
                            <label className="text-sm font-medium">Nome</label>
                            <input
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                className="w-full rounded-xl border border-[#334D40]/20 bg-white px-3 py-2"
                                required
                                minLength={2}
                            />
                        </div>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(event) =>
                                    setIsActive(event.target.checked)
                                }
                            />
                            Categoria ativa
                        </label>

                        {errorMessage ? (
                            <p className="rounded-xl bg-red-100 px-3 py-2 text-sm text-red-800">
                                {errorMessage}
                            </p>
                        ) : null}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-xl bg-[#334D40] px-4 py-2 font-semibold text-[#DBD7CB] disabled:opacity-70"
                        >
                            {isSubmitting
                                ? "Salvando..."
                                : editingCategoryId
                                  ? "Salvar alterações"
                                  : "Criar categoria"}
                        </button>
                        {editingCategoryId ? (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="ml-2 rounded-xl border border-[#334D40]/20 px-4 py-2 text-sm"
                            >
                                Cancelar edição
                            </button>
                        ) : null}
                    </form>

                    <div className="space-y-3 rounded-2xl border border-[#334D40]/15 bg-white p-5 shadow-sm">
                        <h2 className="text-xl font-semibold [font-family:var(--font-title)]">
                            Categorias cadastradas
                        </h2>
                        {categories.length === 0 ? (
                            <p className="text-sm text-[#334D40]/80">
                                Nenhuma categoria cadastrada.
                            </p>
                        ) : (
                            categories.map((category) => (
                                <article
                                    key={category.id}
                                    className="rounded-xl border border-[#334D40]/15 bg-white p-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-semibold">
                                                {category.name}
                                            </p>
                                            <p className="text-xs text-[#334D40]/75">
                                                {category.isActive
                                                    ? "Ativa"
                                                    : "Inativa"}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onEditCategory(category.id)
                                            }
                                            className="rounded-lg border border-[#334D40]/20 px-2 py-1 text-xs"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onDeleteCategory(category.id)
                                            }
                                            className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700"
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
