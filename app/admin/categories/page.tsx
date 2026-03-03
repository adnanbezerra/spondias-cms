"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminSidebar } from "@/src/components/admin/admin-sidebar";
import {
    fetchJson,
    type AdminCategory,
} from "@/src/components/admin/admin-api";
import { NewCategoryDialog } from "@/src/components/admin/dashboard/new-category-dialog";
import {
    initialCategoryForm,
    type CategoryForm,
} from "@/src/components/admin/dashboard/dashboard-types";
import { useAdminToast } from "@/src/components/admin/admin-toast";

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<AdminCategory[]>([]);
    const [form, setForm] = useState<CategoryForm>(initialCategoryForm);
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
        null,
    );
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { showToast } = useAdminToast();

    const loadData = useCallback(async () => {
        const payload = await fetchJson<AdminCategory[]>(
            "/api/admin/categories",
        );
        setCategories(payload);
    }, []);

    useEffect(() => {
        loadData().catch(() => {
            setErrorMessage("Falha ao carregar categorias.");
            showToast("Falha ao carregar categorias.", { variant: "error" });
        });
    }, [loadData, showToast]);

    const resetForm = () => {
        setForm(initialCategoryForm);
        setEditingCategoryId(null);
    };

    const onOpenCreate = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    const onEditCategory = async (categoryId: string) => {
        setErrorMessage(null);

        try {
            const category = await fetchJson<AdminCategory>(
                `/api/admin/categories/${categoryId}`,
            );
            setEditingCategoryId(category.id);
            setForm({
                name: category.name,
                isActive: category.isActive,
            });
            setIsDialogOpen(true);
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
            if (editingCategoryId) {
                await fetchJson<AdminCategory>(
                    `/api/admin/categories/${editingCategoryId}`,
                    {
                        method: "PATCH",
                        body: JSON.stringify(form),
                    },
                );
                showToast("Categoria atualizada com sucesso.", {
                    variant: "success",
                });
            } else {
                await fetchJson<AdminCategory>("/api/admin/categories", {
                    method: "POST",
                    body: JSON.stringify(form),
                });
                showToast("Categoria criada com sucesso.", {
                    variant: "success",
                });
            }

            setIsDialogOpen(false);
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
                <header className="mb-6 flex items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#334D40]/65">
                            Catálogo
                        </p>
                        <h1 className="mt-1 text-4xl font-semibold [font-family:var(--font-title)]">
                            Categorias
                        </h1>
                    </div>

                    <button
                        type="button"
                        onClick={onOpenCreate}
                        className="cursor-pointer rounded-xl border border-[#334D40]/20 bg-[#DBD7CB]/60 px-5 py-3 text-sm font-semibold"
                    >
                        Adicionar Nova Categoria
                    </button>
                </header>

                <NewCategoryDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    form={form}
                    onChange={setForm}
                    onSubmit={onSubmitCategory}
                    isSubmitting={isSubmitting}
                    showTrigger={false}
                    title={
                        editingCategoryId
                            ? "Editar Categoria"
                            : "Nova Categoria"
                    }
                    description={
                        editingCategoryId
                            ? "Atualize os dados da categoria selecionada."
                            : "Crie a categoria e publique na vitrine quando quiser."
                    }
                    submitLabel={
                        editingCategoryId
                            ? "Salvar Alterações"
                            : "Salvar Categoria"
                    }
                />

                {errorMessage ? (
                    <p className="mb-4 rounded-xl bg-red-100 px-3 py-2 text-sm text-red-800">
                        {errorMessage}
                    </p>
                ) : null}

                <section className="rounded-2xl border border-[#334D40]/15 bg-white p-5 shadow-sm">
                    <h2 className="text-xl font-semibold [font-family:var(--font-title)]">
                        Categorias cadastradas
                    </h2>

                    <div className="mt-3 space-y-3">
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
                                        <div className="flex items-center gap-2">
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
                                                    onDeleteCategory(
                                                        category.id,
                                                    )
                                                }
                                                className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700"
                                            >
                                                Excluir
                                            </button>
                                        </div>
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
