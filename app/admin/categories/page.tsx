"use client";

import { AdminSidebar } from "@/src/components/admin/admin-sidebar";
import { NewCategoryDialog } from "@/src/components/admin/dashboard/new-category-dialog";
import { CategoriesList } from "@/src/components/admin/pages/categories/categories-list";
import { useAdminCategoriesPage } from "@/src/components/admin/pages/categories/use-admin-categories-page";

function CategoriesSkeleton() {
    return (
        <div className="animate-pulse">
            <header className="mb-6 flex items-end justify-between gap-4">
                <div className="space-y-2">
                    <div className="h-3 w-24 rounded bg-[#334D40]/10" />
                    <div className="h-10 w-56 rounded bg-[#334D40]/10" />
                </div>
                <div className="h-12 w-52 rounded-xl bg-[#334D40]/10" />
            </header>
            <section className="rounded-2xl border border-[#334D40]/15 bg-white p-5 shadow-sm">
                <div className="h-7 w-56 rounded bg-[#334D40]/10" />
                <div className="mt-4 space-y-3">
                    <div className="h-16 rounded-xl bg-[#F5F4EF]" />
                    <div className="h-16 rounded-xl bg-[#F5F4EF]" />
                    <div className="h-16 rounded-xl bg-[#F5F4EF]" />
                </div>
            </section>
        </div>
    );
}

export default function AdminCategoriesPage() {
    const {
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
    } = useAdminCategoriesPage();

    return (
        <div className="min-h-screen bg-[#F5F4EF] text-[#334D40]">
            <AdminSidebar />
            <main className="px-4 py-6 sm:px-6 lg:ml-72 lg:px-10 lg:py-10">
                {isLoading ? (
                    <CategoriesSkeleton />
                ) : (
                    <>
                        <header className="mb-6 flex items-end justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#334D40]/65">
                                    Catálogo
                                </p>
                                <h1 className="mt-1 text-4xl font-semibold [font-family:var(--font-title)]">
                                    Linhas
                                </h1>
                            </div>

                            <button
                                type="button"
                                onClick={onOpenCreate}
                                className="cursor-pointer rounded-xl border border-[#334D40]/20 bg-[#DBD7CB]/60 px-5 py-3 text-sm font-semibold"
                            >
                                Adicionar Nova Linha
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
                                    ? "Editar Linha"
                                    : "Nova Linha"
                            }
                            description={
                                editingCategoryId
                                    ? "Atualize os dados da linha selecionada."
                                    : "Crie a linha e configure o preço por grama."
                            }
                            submitLabel={
                                editingCategoryId
                                    ? "Salvar Alterações"
                                    : "Salvar Linha"
                            }
                        />

                        {errorMessage ? (
                            <p className="mb-4 rounded-xl bg-red-100 px-3 py-2 text-sm text-red-800">
                                {errorMessage}
                            </p>
                        ) : null}

                        <section className="rounded-2xl border border-[#334D40]/15 bg-white p-5 shadow-sm">
                            <h2 className="text-xl font-semibold [font-family:var(--font-title)]">
                                Linhas cadastradas
                            </h2>

                            <div className="mt-3 space-y-3">
                                <CategoriesList
                                    categories={categories}
                                    onEditCategory={onEditCategory}
                                    onDeleteCategory={onDeleteCategory}
                                />
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}
