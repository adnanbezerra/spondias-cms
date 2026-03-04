"use client";

import type { AdminCategory } from "@/src/components/admin/admin-api";
import { NewCategoryDialog } from "@/src/components/admin/dashboard/new-category-dialog";
import { NewProductDialog } from "@/src/components/admin/dashboard/new-product-dialog";
import type {
    CategoryForm,
    ProductForm,
} from "@/src/components/admin/dashboard/dashboard-types";

type DashboardQuickActionsProps = {
    categories: AdminCategory[];
    categoryForm: CategoryForm;
    productForm: ProductForm;
    selectedCategoryIds: string[];
    isCategoryDialogOpen: boolean;
    isProductDialogOpen: boolean;
    isCategorySubmitting: boolean;
    isProductSubmitting: boolean;
    onChangeCategoryForm: (form: CategoryForm) => void;
    onChangeProductForm: (form: ProductForm) => void;
    onToggleCategory: (categoryId: string) => void;
    onChangeProductDialog: (open: boolean) => void;
    onChangeCategoryDialog: (open: boolean) => void;
    onChangeProductImage: (file: File | null) => void;
    onSubmitCategory: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
    onSubmitProduct: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
};

export function DashboardQuickActions({
    categories,
    categoryForm,
    productForm,
    selectedCategoryIds,
    isCategoryDialogOpen,
    isProductDialogOpen,
    isCategorySubmitting,
    isProductSubmitting,
    onChangeCategoryForm,
    onChangeProductForm,
    onToggleCategory,
    onChangeProductDialog,
    onChangeCategoryDialog,
    onChangeProductImage,
    onSubmitCategory,
    onSubmitProduct,
}: DashboardQuickActionsProps) {
    return (
        <section className="mt-8 flex flex-col gap-3 sm:flex-row">
            <NewProductDialog
                open={isProductDialogOpen}
                onOpenChange={onChangeProductDialog}
                form={productForm}
                onChange={onChangeProductForm}
                categories={categories.filter((category) => category.isActive)}
                selectedCategoryIds={selectedCategoryIds}
                onToggleCategory={onToggleCategory}
                onImageFileChange={onChangeProductImage}
                onSubmit={onSubmitProduct}
                isSubmitting={isProductSubmitting}
            />

            <NewCategoryDialog
                open={isCategoryDialogOpen}
                onOpenChange={onChangeCategoryDialog}
                form={categoryForm}
                onChange={onChangeCategoryForm}
                onSubmit={onSubmitCategory}
                isSubmitting={isCategorySubmitting}
            />
        </section>
    );
}
