"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    fetchJson,
    uploadImage,
    type AdminCategory,
    type AdminProduct,
} from "@/src/components/admin/admin-api";
import { useAdminToast } from "@/src/components/admin/admin-toast";
import {
    initialProductForm,
    type ProductForm,
} from "@/src/components/admin/dashboard/dashboard-types";
import {
    confirmDestructiveAction,
    getErrorMessage,
    handlePageError,
    runWithSubmittingState,
    toggleStringInList,
} from "@/src/components/admin/pages/shared/admin-page-helpers";

export function useAdminProductsPage() {
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [categories, setCategories] = useState<AdminCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [form, setForm] = useState<ProductForm>(initialProductForm);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [editingProductId, setEditingProductId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useAdminToast();

    const categoryMap = useMemo(
        () => new Map(categories.map((category) => [category.id, category.name])),
        [categories],
    );

    const loadData = useCallback(async () => {
        const [productsPayload, categoriesPayload] = await Promise.all([
            fetchJson<AdminProduct[]>("/api/admin/products"),
            fetchJson<AdminCategory[]>("/api/admin/categories"),
        ]);

        setProducts(productsPayload);
        setCategories(categoriesPayload.filter((category) => category.isActive));
    }, []);

    useEffect(() => {
        loadData()
            .catch((error) => {
                handlePageError({
                    error,
                    showToast,
                    toastMessage: "Falha ao carregar dados de produtos.",
                    fallbackMessage: "Falha ao carregar dados de produtos.",
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [loadData, showToast]);

    const resetForm = () => {
        setForm(initialProductForm);
        setImageFile(null);
        setCurrentImageUrl(null);
        setSelectedCategoryIds([]);
        setEditingProductId(null);
    };

    const onOpenCreate = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    const onEditProduct = async (productId: string) => {
        try {
            const product = await fetchJson<AdminProduct>(
                `/api/admin/products/${productId}`,
            );

            setEditingProductId(product.id);
            setForm({
                name: product.name,
                price: product.price,
                stock: product.stock,
                discountPercentage: product.discountPercentage,
                isActive: product.isActive,
            });
            setCurrentImageUrl(product.image);
            setImageFile(null);
            setSelectedCategoryIds(product.categoryIds);
            setIsDialogOpen(true);
        } catch (error) {
            handlePageError({
                error,
                showToast,
                toastMessage: "Falha ao carregar produto para edição.",
                fallbackMessage: "Falha ao carregar produto.",
            });
        }
    };

    const onToggleCategory = (categoryId: string) => {
        setSelectedCategoryIds((current) => toggleStringInList(current, categoryId));
    };

    const onSubmitProduct = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        await runWithSubmittingState(setIsSubmitting, async () => {
            try {
                if (selectedCategoryIds.length === 0) {
                    throw new Error(
                        "Selecione ao menos uma categoria para o produto.",
                    );
                }

                let imageUrl = currentImageUrl;
                if (imageFile) {
                    const upload = await uploadImage(imageFile);
                    imageUrl = upload.url;
                }

                const payload = {
                    ...form,
                    image: imageUrl,
                    categoryIds: selectedCategoryIds,
                };

                if (editingProductId) {
                    await fetchJson<AdminProduct>(
                        `/api/admin/products/${editingProductId}`,
                        {
                            method: "PATCH",
                            body: JSON.stringify(payload),
                        },
                    );
                } else {
                    await fetchJson<AdminProduct>("/api/admin/products", {
                        method: "POST",
                        body: JSON.stringify(payload),
                    });
                }

                setIsDialogOpen(false);
                resetForm();
                await loadData();
                showToast(
                    editingProductId
                        ? "Produto atualizado com sucesso."
                        : "Produto criado com sucesso.",
                    { variant: "success" },
                );
            } catch (error) {
                showToast(getErrorMessage(error, "Falha ao salvar produto."), {
                    variant: "error",
                    durationMs: 5000,
                });
            }
        });
    };

    const onDeleteProduct = async (productId: string) => {
        const approved = confirmDestructiveAction(
            "Deseja realmente excluir este produto?",
        );
        if (!approved) return;

        try {
            await fetchJson<{ deleted: true }>(`/api/admin/products/${productId}`, {
                method: "DELETE",
            });
            showToast("Produto excluído com sucesso.", { variant: "success" });

            if (editingProductId === productId) {
                resetForm();
            }
            await loadData();
        } catch (error) {
            handlePageError({
                error,
                showToast,
                toastMessage: "Falha ao excluir produto.",
                fallbackMessage: "Falha ao excluir produto.",
            });
        }
    };

    return {
        products,
        categories,
        form,
        imageFile,
        selectedCategoryIds,
        currentImageUrl,
        editingProductId,
        isDialogOpen,
        isLoading,
        isSubmitting,
        categoryMap,
        setForm,
        setImageFile,
        setIsDialogOpen,
        onOpenCreate,
        onToggleCategory,
        onSubmitProduct,
        onEditProduct,
        onDeleteProduct,
    };
}
