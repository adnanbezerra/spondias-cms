"use client";

import { AdminSidebar } from "@/src/components/admin/admin-sidebar";
import { DashboardQuickActions } from "@/src/components/admin/pages/dashboard/dashboard-quick-actions";
import { DashboardStatsGrid } from "@/src/components/admin/pages/dashboard/dashboard-stats-grid";
import { useAdminDashboardPage } from "@/src/components/admin/pages/dashboard/use-admin-dashboard-page";

export default function AdminDashboardPage() {
    const {
        categories,
        products,
        sections,
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
    } = useAdminDashboardPage();

    return (
        <div className="min-h-screen bg-[#F5F4EF] text-[#334D40]">
            <AdminSidebar />

            <main className="px-4 py-6 sm:px-6 lg:ml-72 lg:px-10 lg:py-10">
                <header>
                    <h1 className="text-4xl font-semibold [font-family:var(--font-title)]">
                        Painel Administrativo
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-[#334D40]/80">
                        Gerencie categorias, produtos e layout da loja em um fluxo
                        mais direto.
                    </p>
                </header>

                <DashboardQuickActions
                    categories={categories}
                    categoryForm={categoryForm}
                    productForm={productForm}
                    selectedCategoryIds={selectedCategoryIds}
                    isCategoryDialogOpen={isCategoryDialogOpen}
                    isProductDialogOpen={isProductDialogOpen}
                    isCategorySubmitting={isCategorySubmitting}
                    isProductSubmitting={isProductSubmitting}
                    onChangeCategoryForm={setCategoryForm}
                    onChangeProductForm={setProductForm}
                    onToggleCategory={onToggleCategory}
                    onChangeProductDialog={onChangeProductDialog}
                    onChangeCategoryDialog={setIsCategoryDialogOpen}
                    onChangeProductImage={setProductImageFile}
                    onSubmitCategory={onSubmitCategory}
                    onSubmitProduct={onSubmitProduct}
                />

                <DashboardStatsGrid
                    productCount={products.length}
                    categoryCount={categories.length}
                    activeSectionsCount={sections.length}
                />
            </main>
        </div>
    );
}
