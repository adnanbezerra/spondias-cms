"use client";

import { AdminSidebar } from "@/src/components/admin/admin-sidebar";
import { SectionDialog } from "@/src/components/admin/pages/sections/section-dialog";
import { SectionsList } from "@/src/components/admin/pages/sections/sections-list";
import { SectionsPreview } from "@/src/components/admin/pages/sections/sections-preview";
import { useAdminSectionsPage } from "@/src/components/admin/pages/sections/use-admin-sections-page";

function SectionsSkeleton() {
    return (
        <div className="animate-pulse">
            <header className="flex flex-col gap-4 border-b border-[#334D40]/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-2">
                    <div className="h-3 w-36 rounded bg-[#334D40]/10" />
                    <div className="h-10 w-64 rounded bg-[#334D40]/10" />
                    <div className="h-4 w-80 rounded bg-[#334D40]/10" />
                </div>
                <div className="h-11 w-44 rounded-xl bg-[#334D40]/10" />
            </header>

            <section className="mt-8 grid gap-6 lg:grid-cols-12">
                <div className="space-y-3 lg:col-span-7">
                    <div className="h-28 rounded-2xl border border-[#334D40]/15 bg-white" />
                    <div className="h-28 rounded-2xl border border-[#334D40]/15 bg-white" />
                    <div className="h-28 rounded-2xl border border-[#334D40]/15 bg-white" />
                </div>
                <aside className="lg:col-span-5">
                    <div className="h-[380px] rounded-2xl border border-[#334D40]/15 bg-white" />
                </aside>
            </section>
        </div>
    );
}

export default function AdminSectionsPage() {
    const {
        categories,
        sectionCategories,
        selectedPreviewSectionId,
        isDialogOpen,
        editingSectionId,
        currentBannerImg,
        selectedCategoryIds,
        form,
        isLoading,
        isSubmitting,
        errorMessage,
        sortedSections,
        categoryMap,
        previewSections,
        setForm,
        setBannerFile,
        setIsDialogOpen,
        setSelectedPreviewSectionId,
        onOpenCreate,
        onOpenEdit,
        onToggleCategory,
        onToggleBanner,
        onSubmit,
        onDeleteSection,
        onMoveSection,
        resetForm,
    } = useAdminSectionsPage();

    return (
        <div className="min-h-screen bg-[#F5F4EF] text-[#334D40]">
            <AdminSidebar />

            <main className="px-4 py-6 sm:px-6 lg:ml-72 lg:px-10 lg:py-10">
                {isLoading ? (
                    <SectionsSkeleton />
                ) : (
                    <>
                        <header className="flex flex-col gap-4 border-b border-[#334D40]/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#334D40]/65">
                                    Layout Manager
                                </p>
                                <h1 className="mt-1 text-4xl font-semibold [font-family:var(--font-title)]">
                                    Gerenciar Seções
                                </h1>
                                <p className="mt-2 text-sm text-[#334D40]/80">
                                    Reordene e edite as seções que aparecem na
                                    vitrine.
                                </p>
                            </div>

                            <SectionDialog
                                open={isDialogOpen}
                                onOpenChange={setIsDialogOpen}
                                onOpenCreate={onOpenCreate}
                                onSubmit={onSubmit}
                                onResetForm={resetForm}
                                editingSectionId={editingSectionId}
                                form={form}
                                onChangeForm={setForm}
                                categories={categories}
                                selectedCategoryIds={selectedCategoryIds}
                                onToggleCategory={onToggleCategory}
                                onToggleBanner={onToggleBanner}
                                onBannerFileChange={setBannerFile}
                                currentBannerImg={currentBannerImg}
                                isSubmitting={isSubmitting}
                            />
                        </header>

                        {errorMessage ? (
                            <p className="mt-4 rounded-xl bg-red-100 px-4 py-2 text-sm text-red-800">
                                {errorMessage}
                            </p>
                        ) : null}

                        <section className="mt-8 grid gap-6 lg:grid-cols-12">
                            <div className="space-y-3 lg:col-span-7">
                                <SectionsList
                                    sections={sortedSections}
                                    selectedPreviewSectionId={
                                        selectedPreviewSectionId
                                    }
                                    onSelectPreview={
                                        setSelectedPreviewSectionId
                                    }
                                    onMoveSection={onMoveSection}
                                    onEditSection={onOpenEdit}
                                    onDeleteSection={onDeleteSection}
                                />
                            </div>

                            <aside className="lg:col-span-5">
                                <SectionsPreview
                                    sections={previewSections}
                                    sectionCategories={sectionCategories}
                                    categoryMap={categoryMap}
                                />
                            </aside>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}
