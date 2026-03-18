"use client";

import { useCallback, useEffect, useState } from "react";
import {
    fetchJson,
    uploadImage,
    type AdminCategory,
    type AdminProduct,
    type AdminSection,
} from "@/src/components/admin/admin-api";
import { useAdminToast } from "@/src/components/admin/admin-toast";
import {
    initialCategoryForm,
    initialProductForm,
    type CategoryForm,
    type ProductForm,
} from "@/src/components/admin/dashboard/dashboard-types";
import {
    handlePageError,
    runWithSubmittingState,
} from "@/src/components/admin/pages/shared/admin-page-helpers";

export function useAdminDashboardPage() {
    const [categories, setCategories] = useState<AdminCategory[]>([]);
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [sections, setSections] = useState<AdminSection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [categoryForm, setCategoryForm] =
        useState<CategoryForm>(initialCategoryForm);
    const [productForm, setProductForm] =
        useState<ProductForm>(initialProductForm);
    const [productImageFile, setProductImageFile] = useState<File | null>(null);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
    const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);
    const [isProductSubmitting, setIsProductSubmitting] = useState(false);
    const { showToast } = useAdminToast();

    const loadData = useCallback(async () => {
        const [categoriesPayload, productsPayload, sectionsPayload] =
            await Promise.all([
                fetchJson<AdminCategory[]>("/api/admin/categories"),
                fetchJson<AdminProduct[]>("/api/admin/products"),
                fetchJson<AdminSection[]>("/api/admin/sections"),
            ]);

        setCategories(categoriesPayload);
        setProducts(productsPayload);
        setSections(sectionsPayload.filter((section) => section.isActive));
    }, []);

    useEffect(() => {
        loadData()
            .catch((error) => {
                handlePageError({
                    error,
                    showToast,
                    toastMessage: "Falha ao carregar o dashboard.",
                    fallbackMessage: "Falha ao carregar o dashboard.",
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [loadData, showToast]);

    const onSubmitCategory = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        await runWithSubmittingState(setIsCategorySubmitting, async () => {
            try {
                await fetchJson<AdminCategory>("/api/admin/categories", {
                    method: "POST",
                    body: JSON.stringify(categoryForm),
                });
                setCategoryForm(initialCategoryForm);
                setIsCategoryDialogOpen(false);
                await loadData();
                showToast("Linha criada com sucesso.", { variant: "success" });
            } catch (error) {
                handlePageError({
                    error,
                    showToast,
                    toastMessage: "Falha ao criar linha.",
                    fallbackMessage: "Falha ao criar linha.",
                });
            }
        });
    };

    const onSubmitProduct = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        await runWithSubmittingState(setIsProductSubmitting, async () => {
            try {
                if (selectedCategoryIds.length === 0) {
                    throw new Error(
                        "Selecione uma linha para o produto.",
                    );
                }

                const imageUrl = productImageFile
                    ? (await uploadImage(productImageFile)).url
                    : null;

                await fetchJson<AdminProduct>("/api/admin/products", {
                    method: "POST",
                    body: JSON.stringify({
                        ...productForm,
                        image: imageUrl,
                        categoryIds: selectedCategoryIds,
                    }),
                });

                setProductForm(initialProductForm);
                setProductImageFile(null);
                setSelectedCategoryIds([]);
                setIsProductDialogOpen(false);
                await loadData();
                showToast("Produto criado com sucesso.", { variant: "success" });
            } catch (error) {
                handlePageError({
                    error,
                    showToast,
                    toastMessage: "Falha ao criar produto.",
                    fallbackMessage: "Falha ao criar produto.",
                });
            }
        });
    };

    const onToggleCategory = (categoryId: string) => {
        setSelectedCategoryIds([categoryId]);
    };

    const onChangeProductDialog = (open: boolean) => {
        setIsProductDialogOpen(open);
        if (open) {
            setProductForm(initialProductForm);
            setProductImageFile(null);
            setSelectedCategoryIds([]);
        }
    };

    return {
        categories,
        products,
        sections,
        isLoading,
        categoryForm,
        productForm,
        selectedCategoryIds,
        isCategoryDialogOpen,
        isProductDialogOpen,
        isCategorySubmitting,
        isProductSubmitting,
        setCategoryForm,
        setProductForm,
        setIsCategoryDialogOpen,
        setProductImageFile,
        onToggleCategory,
        onChangeProductDialog,
        onSubmitCategory,
        onSubmitProduct,
    };
}
