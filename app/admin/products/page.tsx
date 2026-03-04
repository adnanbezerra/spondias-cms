"use client";

import { AdminSidebar } from "@/src/components/admin/admin-sidebar";
import { NewProductDialog } from "@/src/components/admin/dashboard/new-product-dialog";
import { ProductsList } from "@/src/components/admin/pages/products/products-list";
import { useAdminProductsPage } from "@/src/components/admin/pages/products/use-admin-products-page";

function ProductsSkeleton() {
    return (
        <div className="animate-pulse">
            <header className="mb-6 flex items-end justify-between gap-4">
                <div className="space-y-2">
                    <div className="h-3 w-24 rounded bg-[#334D40]/10" />
                    <div className="h-10 w-48 rounded bg-[#334D40]/10" />
                </div>
                <div className="h-12 w-56 rounded-xl bg-[#334D40]/10" />
            </header>
            <section className="rounded-2xl border border-[#334D40]/15 bg-white p-5 shadow-sm">
                <div className="h-7 w-56 rounded bg-[#334D40]/10" />
                <div className="mt-4 space-y-3">
                    <div className="h-20 rounded-xl bg-[#F5F4EF]" />
                    <div className="h-20 rounded-xl bg-[#F5F4EF]" />
                    <div className="h-20 rounded-xl bg-[#F5F4EF]" />
                </div>
            </section>
        </div>
    );
}

export default function AdminProductsPage() {
    const {
        products,
        categories,
        form,
        selectedCategoryIds,
        currentImageUrl,
        editingProductId,
        isDialogOpen,
        isLoading,
        isSubmitting,
        errorMessage,
        categoryMap,
        setForm,
        setImageFile,
        setIsDialogOpen,
        onOpenCreate,
        onToggleCategory,
        onSubmitProduct,
        onEditProduct,
        onDeleteProduct,
    } = useAdminProductsPage();

    return (
        <div className="min-h-screen bg-[#F5F4EF] text-[#334D40]">
            <AdminSidebar />
            <main className="px-4 py-6 sm:px-6 lg:ml-72 lg:px-10 lg:py-10">
                {isLoading ? (
                    <ProductsSkeleton />
                ) : (
                    <>
                        <header className="mb-6 flex items-end justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#334D40]/65">
                                    Catálogo
                                </p>
                                <h1 className="mt-1 text-4xl font-semibold [font-family:var(--font-title)]">
                                    Produtos
                                </h1>
                            </div>

                            <button
                                type="button"
                                onClick={onOpenCreate}
                                className="cursor-pointer rounded-xl bg-[#334D40] px-5 py-3 text-sm font-semibold text-[#DBD7CB]"
                            >
                                Adicionar Novo Produto
                            </button>
                        </header>

                        <NewProductDialog
                            open={isDialogOpen}
                            onOpenChange={setIsDialogOpen}
                            form={form}
                            onChange={setForm}
                            categories={categories}
                            selectedCategoryIds={selectedCategoryIds}
                            onToggleCategory={onToggleCategory}
                            currentImageUrl={currentImageUrl}
                            onImageFileChange={setImageFile}
                            onSubmit={onSubmitProduct}
                            isSubmitting={isSubmitting}
                            showTrigger={false}
                            title={
                                editingProductId
                                    ? "Editar Produto"
                                    : "Novo Produto"
                            }
                            description={
                                editingProductId
                                    ? "Atualize os dados do produto selecionado."
                                    : "Cadastro rápido de produto sem sair da página."
                            }
                            submitLabel={
                                editingProductId
                                    ? "Salvar Alterações"
                                    : "Salvar Produto"
                            }
                        />

                        {errorMessage ? (
                            <p className="mb-4 rounded-xl bg-red-100 px-3 py-2 text-sm text-red-800">
                                {errorMessage}
                            </p>
                        ) : null}

                        <section className="rounded-2xl border border-[#334D40]/15 bg-white p-5 shadow-sm">
                            <h2 className="text-xl font-semibold [font-family:var(--font-title)]">
                                Produtos cadastrados
                            </h2>

                            <div className="mt-3 space-y-3">
                                <ProductsList
                                    products={products}
                                    categoryMap={categoryMap}
                                    onEditProduct={onEditProduct}
                                    onDeleteProduct={onDeleteProduct}
                                />
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}
