"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminSidebar } from "@/src/components/admin/admin-sidebar";
import {
    fetchJson,
    uploadImage,
    type AdminCategory,
    type AdminProduct,
    type AdminSection,
} from "@/src/components/admin/admin-api";
import { useAdminToast } from "@/src/components/admin/admin-toast";
import { DashboardStatCard } from "@/src/components/admin/dashboard/dashboard-stat-card";
import {
    initialCategoryForm,
    initialProductForm,
    type CategoryForm,
    type ProductForm,
} from "@/src/components/admin/dashboard/dashboard-types";
import { NewCategoryDialog } from "@/src/components/admin/dashboard/new-category-dialog";
import { NewProductDialog } from "@/src/components/admin/dashboard/new-product-dialog";

export default function AdminDashboardPage() {
    const [categories, setCategories] = useState<AdminCategory[]>([]);
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [sections, setSections] = useState<AdminSection[]>([]);
    const [categoryForm, setCategoryForm] =
        useState<CategoryForm>(initialCategoryForm);
    const [productForm, setProductForm] =
        useState<ProductForm>(initialProductForm);
    const [productImageFile, setProductImageFile] = useState<File | null>(null);
    const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);
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
        loadData().catch(() => {
            showToast("Falha ao carregar o dashboard.", { variant: "error" });
        });
    }, [loadData, showToast]);

    const onSubmitCategory = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();
        setIsCategorySubmitting(true);

        try {
            await fetchJson<AdminCategory>("/api/admin/categories", {
                method: "POST",
                body: JSON.stringify(categoryForm),
            });
            setCategoryForm(initialCategoryForm);
            setIsCategoryDialogOpen(false);
            await loadData();
            showToast("Categoria criada com sucesso.", { variant: "success" });
        } catch (error) {
            showToast(
                error instanceof Error
                    ? error.message
                    : "Falha ao criar categoria.",
                { variant: "error" },
            );
        } finally {
            setIsCategorySubmitting(false);
        }
    };

    const onSubmitProduct = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsProductSubmitting(true);

        try {
            const imageUrl = productImageFile
                ? (await uploadImage(productImageFile)).url
                : null;

            const createdProduct = await fetchJson<AdminProduct>(
                "/api/admin/products",
                {
                    method: "POST",
                    body: JSON.stringify({
                        ...productForm,
                        image: imageUrl,
                    }),
                },
            );

            await fetchJson<{ updated: true }>(
                `/api/admin/products/${createdProduct.id}/sections`,
                {
                    method: "PUT",
                    body: JSON.stringify({ sectionIds: selectedSectionIds }),
                },
            );

            setProductForm(initialProductForm);
            setProductImageFile(null);
            setSelectedSectionIds([]);
            setIsProductDialogOpen(false);
            await loadData();
            showToast("Produto criado com sucesso.", { variant: "success" });
        } catch (error) {
            showToast(
                error instanceof Error
                    ? error.message
                    : "Falha ao criar produto.",
                { variant: "error" },
            );
        } finally {
            setIsProductSubmitting(false);
        }
    };

    const onToggleSection = (sectionId: string) => {
        setSelectedSectionIds((current) =>
            current.includes(sectionId)
                ? current.filter((id) => id !== sectionId)
                : [...current, sectionId],
        );
    };

    return (
        <div className="min-h-screen bg-[#F5F4EF] text-[#334D40]">
            <AdminSidebar />

            <main className="px-4 py-6 sm:px-6 lg:ml-72 lg:px-10 lg:py-10">
                <header>
                    <h1 className="text-4xl font-semibold [font-family:var(--font-title)]">
                        Painel Administrativo
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-[#334D40]/80">
                        Gerencie categorias, produtos e layout da loja em um
                        fluxo mais direto.
                    </p>
                </header>

                <section className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <NewProductDialog
                        open={isProductDialogOpen}
                        onOpenChange={setIsProductDialogOpen}
                        form={productForm}
                        onChange={setProductForm}
                        sections={sections}
                        selectedSectionIds={selectedSectionIds}
                        onToggleSection={onToggleSection}
                        onImageFileChange={setProductImageFile}
                        onSubmit={onSubmitProduct}
                        isSubmitting={isProductSubmitting}
                    />

                    <NewCategoryDialog
                        open={isCategoryDialogOpen}
                        onOpenChange={setIsCategoryDialogOpen}
                        form={categoryForm}
                        onChange={setCategoryForm}
                        onSubmit={onSubmitCategory}
                        isSubmitting={isCategorySubmitting}
                    />
                </section>

                <section className="mt-8 grid gap-4 lg:grid-cols-3">
                    <DashboardStatCard
                        title="Produtos"
                        href="/admin/products"
                        count={products.length}
                        subtitle="produtos cadastrados"
                    />
                    <DashboardStatCard
                        title="Categorias"
                        href="/admin/categories"
                        count={categories.length}
                        subtitle="categorias cadastradas"
                    />
                    <DashboardStatCard
                        title="Seções"
                        href="/admin/sections"
                        count={sections.length}
                        subtitle="seções ativas na vitrine"
                    />
                </section>
            </main>
        </div>
    );
}
