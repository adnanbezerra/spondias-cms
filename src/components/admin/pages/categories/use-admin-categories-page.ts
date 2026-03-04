"use client";

import { useCallback, useEffect, useState } from "react";
import {
    fetchJson,
    type AdminCategory,
} from "@/src/components/admin/admin-api";
import { useAdminToast } from "@/src/components/admin/admin-toast";
import {
    initialCategoryForm,
    type CategoryForm,
} from "@/src/components/admin/dashboard/dashboard-types";
import {
    confirmDestructiveAction,
    handlePageError,
    runWithSubmittingState,
} from "@/src/components/admin/pages/shared/admin-page-helpers";

export function useAdminCategoriesPage() {
    const [categories, setCategories] = useState<AdminCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [form, setForm] = useState<CategoryForm>(initialCategoryForm);
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
        null,
    );
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { showToast } = useAdminToast();

    const loadData = useCallback(async () => {
        const payload = await fetchJson<AdminCategory[]>("/api/admin/categories");
        setCategories(payload);
    }, []);

    useEffect(() => {
        loadData()
            .catch((error) => {
                handlePageError({
                    error,
                    showToast,
                    toastMessage: "Falha ao carregar categorias.",
                    fallbackMessage: "Falha ao carregar categorias.",
                    setErrorMessage,
                });
            })
            .finally(() => {
                setIsLoading(false);
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
            handlePageError({
                error,
                showToast,
                toastMessage: "Falha ao carregar categoria para edição.",
                fallbackMessage: "Falha ao carregar categoria.",
                setErrorMessage,
            });
        }
    };

    const onSubmitCategory = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();
        setErrorMessage(null);
        await runWithSubmittingState(setIsSubmitting, async () => {
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
                handlePageError({
                    error,
                    showToast,
                    toastMessage: "Falha ao salvar categoria.",
                    fallbackMessage: "Falha ao salvar categoria.",
                    setErrorMessage,
                });
            }
        });
    };

    const onDeleteCategory = async (categoryId: string) => {
        const approved = confirmDestructiveAction(
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
            handlePageError({
                error,
                showToast,
                toastMessage: "Falha ao excluir categoria.",
                fallbackMessage: "Falha ao excluir categoria.",
                setErrorMessage,
            });
        }
    };

    return {
        categories,
        form,
        editingCategoryId,
        isDialogOpen,
        isLoading,
        isSubmitting,
        errorMessage,
        setForm,
        setIsDialogOpen,
        onOpenCreate,
        onEditCategory,
        onSubmitCategory,
        onDeleteCategory,
    };
}
