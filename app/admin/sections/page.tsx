"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminSidebar } from "@/src/components/admin/admin-sidebar";
import { useAdminToast } from "@/src/components/admin/admin-toast";
import { fetchJson, uploadImage, type AdminCategory, type AdminSection } from "@/src/components/admin/admin-api";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogTitle,
    DialogTrigger,
} from "@/src/components/ui/dialog";

type SectionCategoriesMap = Record<string, string[]>;

type SectionForm = {
    name: string;
    order: number;
    isActive: boolean;
    isBanner: boolean;
};

const initialForm: SectionForm = {
    name: "",
    order: 1,
    isActive: true,
    isBanner: false,
};

export default function AdminSectionsPage() {
    const [sections, setSections] = useState<AdminSection[]>([]);
    const [categories, setCategories] = useState<AdminCategory[]>([]);
    const [sectionCategories, setSectionCategories] = useState<SectionCategoriesMap>(
        {},
    );
    const [selectedPreviewSectionId, setSelectedPreviewSectionId] = useState<string | null>(
        null,
    );
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
    const [currentBannerImg, setCurrentBannerImg] = useState<string | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [form, setForm] = useState<SectionForm>(initialForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { showToast } = useAdminToast();

    const sortedSections = useMemo(
        () => [...sections].sort((a, b) => a.order - b.order),
        [sections],
    );

    const activeSections = useMemo(
        () => sortedSections.filter((section) => section.isActive),
        [sortedSections],
    );

    const categoryMap = useMemo(
        () => new Map(categories.map((category) => [category.id, category.name])),
        [categories],
    );

    const loadData = useCallback(async () => {
        const [sectionsPayload, categoriesPayload] = await Promise.all([
            fetchJson<AdminSection[]>("/api/admin/sections"),
            fetchJson<AdminCategory[]>("/api/admin/categories"),
        ]);

        setSections(sectionsPayload);
        setCategories(categoriesPayload.filter((category) => category.isActive));

        const categoriesRelations = await Promise.all(
            sectionsPayload.map(async (section) => {
                const relation = await fetchJson<{ categoryIds: string[] }>(
                    `/api/admin/sections/${section.id}/categories`,
                );
                return [section.id, relation.categoryIds] as const;
            }),
        );

        setSectionCategories(Object.fromEntries(categoriesRelations));

        if (!selectedPreviewSectionId && sectionsPayload.length > 0) {
            setSelectedPreviewSectionId(
                [...sectionsPayload].sort((a, b) => a.order - b.order)[0].id,
            );
        }
    }, [selectedPreviewSectionId]);

    useEffect(() => {
        loadData().catch(() => {
            showToast("Falha ao carregar seções.", { variant: "error" });
            setErrorMessage("Falha ao carregar dados de seções.");
        });
    }, [loadData, showToast]);

    const resetForm = () => {
        setEditingSectionId(null);
        setCurrentBannerImg(null);
        setBannerFile(null);
        setSelectedCategoryIds([]);
        setForm({
            ...initialForm,
            order: sortedSections.length + 1,
        });
    };

    const onOpenCreate = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    const onOpenEdit = async (sectionId: string) => {
        setErrorMessage(null);

        try {
            const [section, relation] = await Promise.all([
                fetchJson<AdminSection>(`/api/admin/sections/${sectionId}`),
                fetchJson<{ categoryIds: string[] }>(
                    `/api/admin/sections/${sectionId}/categories`,
                ),
            ]);

            setEditingSectionId(section.id);
            setCurrentBannerImg(section.bannerImg);
            setBannerFile(null);
            setSelectedCategoryIds(relation.categoryIds);
            setForm({
                name: section.name,
                order: section.order,
                isActive: section.isActive,
                isBanner: section.isBanner,
            });
            setIsDialogOpen(true);
        } catch (error) {
            showToast("Falha ao carregar seção para edição.", { variant: "error" });
            setErrorMessage(error instanceof Error ? error.message : "Falha ao carregar seção.");
        }
    };

    const onToggleCategory = (categoryId: string) => {
        setSelectedCategoryIds((current) =>
            current.includes(categoryId)
                ? current.filter((id) => id !== categoryId)
                : [...current, categoryId],
        );
    };

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage(null);
        setIsSubmitting(true);

        try {
            let bannerImg = currentBannerImg;
            if (form.isBanner && bannerFile) {
                const upload = await uploadImage(bannerFile);
                bannerImg = upload.url;
            }
            if (!form.isBanner) {
                bannerImg = null;
            }

            const payload = {
                name: form.name,
                order: form.order,
                isActive: form.isActive,
                isBanner: form.isBanner,
                bannerImg,
            };

            const section = editingSectionId
                ? await fetchJson<AdminSection>(`/api/admin/sections/${editingSectionId}`, {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                })
                : await fetchJson<AdminSection>("/api/admin/sections", {
                    method: "POST",
                    body: JSON.stringify(payload),
                });

            await fetchJson<{ updated: true }>(
                `/api/admin/sections/${section.id}/categories`,
                {
                    method: "PUT",
                    body: JSON.stringify({ categoryIds: selectedCategoryIds }),
                },
            );

            setIsDialogOpen(false);
            resetForm();
            await loadData();
            showToast(
                editingSectionId
                    ? "Seção atualizada com sucesso."
                    : "Seção criada com sucesso.",
                { variant: "success" },
            );
        } catch (error) {
            showToast("Falha ao salvar seção.", { variant: "error" });
            setErrorMessage(error instanceof Error ? error.message : "Falha ao salvar seção.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const onDeleteSection = async (sectionId: string) => {
        const approved = window.confirm("Deseja realmente excluir esta seção?");
        if (!approved) return;

        try {
            await fetchJson<{ deleted: true }>(`/api/admin/sections/${sectionId}`, {
                method: "DELETE",
            });
            if (selectedPreviewSectionId === sectionId) {
                setSelectedPreviewSectionId(null);
            }
            if (editingSectionId === sectionId) {
                resetForm();
                setIsDialogOpen(false);
            }
            await loadData();
            showToast("Seção excluída com sucesso.", { variant: "success" });
        } catch (error) {
            showToast("Falha ao excluir seção.", { variant: "error" });
            setErrorMessage(error instanceof Error ? error.message : "Falha ao excluir seção.");
        }
    };

    const onMoveSection = async (sectionId: string, direction: "up" | "down") => {
        const currentIndex = sortedSections.findIndex((section) => section.id === sectionId);
        if (currentIndex < 0) return;

        const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
        const targetSection = sortedSections[targetIndex];
        const currentSection = sortedSections[currentIndex];

        if (!targetSection || !currentSection) return;

        try {
            await Promise.all([
                fetchJson<AdminSection>(`/api/admin/sections/${currentSection.id}`, {
                    method: "PATCH",
                    body: JSON.stringify({ order: targetSection.order }),
                }),
                fetchJson<AdminSection>(`/api/admin/sections/${targetSection.id}`, {
                    method: "PATCH",
                    body: JSON.stringify({ order: currentSection.order }),
                }),
            ]);

            await loadData();
            showToast("Ordem de seções atualizada.", { variant: "success" });
        } catch (error) {
            showToast("Falha ao reordenar seções.", { variant: "error" });
            setErrorMessage(error instanceof Error ? error.message : "Falha ao reordenar.");
        }
    };

    const previewSections =
        activeSections.length > 0 ? activeSections : sortedSections.slice(0, 3);

    return (
        <div className="min-h-screen bg-[#F5F4EF] text-[#334D40]">
            <AdminSidebar />

            <main className="px-4 py-6 sm:px-6 lg:ml-72 lg:px-10 lg:py-10">
                <header className="flex flex-col gap-4 border-b border-[#334D40]/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#334D40]/65">
                            Layout Manager
                        </p>
                        <h1 className="mt-1 text-4xl font-semibold [font-family:var(--font-title)]">
                            Gerenciar Seções
                        </h1>
                        <p className="mt-2 text-sm text-[#334D40]/80">
                            Reordene e edite as seções que aparecem na vitrine.
                        </p>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <button
                                type="button"
                                onClick={onOpenCreate}
                                className="cursor-pointer rounded-xl bg-[#334D40] px-4 py-2.5 text-sm font-semibold text-[#DBD7CB]"
                            >
                                Nova Seção
                            </button>
                        </DialogTrigger>
                        <DialogOverlay />
                        <DialogContent>
                            <form onSubmit={onSubmit}>
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingSectionId ? "Editar seção" : "Nova seção"}
                                    </DialogTitle>
                                    <DialogDescription>
                                        Configure como essa seção será exibida na loja.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 px-6 py-5">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Nome</label>
                                        <input
                                            value={form.name}
                                            onChange={(event) =>
                                                setForm((current) => ({
                                                    ...current,
                                                    name: event.target.value,
                                                }))
                                            }
                                            className="w-full rounded-xl border border-[#334D40]/20 px-3 py-2"
                                            required
                                            minLength={2}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Ordem</label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={form.order}
                                            onChange={(event) =>
                                                setForm((current) => ({
                                                    ...current,
                                                    order: Number(event.target.value),
                                                }))
                                            }
                                            className="w-full rounded-xl border border-[#334D40]/20 px-3 py-2"
                                            required
                                        />
                                    </div>

                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={form.isActive}
                                            onChange={(event) =>
                                                setForm((current) => ({
                                                    ...current,
                                                    isActive: event.target.checked,
                                                }))
                                            }
                                        />
                                        Seção ativa
                                    </label>

                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={form.isBanner}
                                            onChange={(event) =>
                                                setForm((current) => ({
                                                    ...current,
                                                    isBanner: event.target.checked,
                                                }))
                                            }
                                        />
                                        Seção de banner
                                    </label>

                                    {form.isBanner ? (
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium">
                                                Imagem de banner
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                onChange={(event) =>
                                                    setBannerFile(event.target.files?.item(0) ?? null)
                                                }
                                                className="w-full rounded-xl border border-[#334D40]/20 px-3 py-2"
                                            />
                                            {currentBannerImg ? (
                                                <p className="text-xs text-[#334D40]/70 break-all">
                                                    Imagem atual: {currentBannerImg}
                                                </p>
                                            ) : null}
                                        </div>
                                    ) : null}

                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">Categorias da seção</p>
                                        <div className="max-h-32 space-y-1 overflow-y-auto rounded-xl border border-[#334D40]/15 p-2">
                                            {categories.length === 0 ? (
                                                <p className="text-sm text-[#334D40]/75">
                                                    Cadastre categorias antes de vincular.
                                                </p>
                                            ) : (
                                                categories.map((category) => (
                                                    <label
                                                        key={category.id}
                                                        className="flex items-center gap-2 text-sm"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCategoryIds.includes(category.id)}
                                                            onChange={() => onToggleCategory(category.id)}
                                                        />
                                                        {category.name}
                                                    </label>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <DialogClose asChild>
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="rounded-xl border border-[#334D40]/20 px-4 py-2 text-sm"
                                        >
                                            Cancelar
                                        </button>
                                    </DialogClose>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="rounded-xl bg-[#334D40] px-4 py-2 text-sm font-semibold text-[#DBD7CB] disabled:opacity-60"
                                    >
                                        {isSubmitting ? "Salvando..." : "Salvar seção"}
                                    </button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </header>

                {errorMessage ? (
                    <p className="mt-4 rounded-xl bg-red-100 px-4 py-2 text-sm text-red-800">
                        {errorMessage}
                    </p>
                ) : null}

                <section className="mt-8 grid gap-6 lg:grid-cols-12">
                    <div className="space-y-3 lg:col-span-7">
                        {sortedSections.length === 0 ? (
                            <div className="rounded-2xl border border-[#334D40]/15 bg-white/85 p-5">
                                <p className="text-sm text-[#334D40]/80">
                                    Nenhuma seção cadastrada.
                                </p>
                            </div>
                        ) : (
                            sortedSections.map((section, index) => (
                                <article
                                    key={section.id}
                                    className={
                                        selectedPreviewSectionId === section.id
                                            ? "rounded-2xl border border-[#334D40] bg-white p-4 shadow-sm"
                                            : "rounded-2xl border border-[#334D40]/15 bg-white/90 p-4"
                                    }
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedPreviewSectionId(section.id)}
                                            className="flex-1 text-left"
                                        >
                                            <p className="font-semibold">{section.name}</p>
                                            <p className="text-xs text-[#334D40]/70">
                                                Ordem {section.order} ·{" "}
                                                {section.isBanner ? "Banner" : "Seção comum"} ·{" "}
                                                {section.isActive ? "Ativa" : "Inativa"}
                                            </p>
                                        </button>

                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => onMoveSection(section.id, "up")}
                                                disabled={index === 0}
                                                className="rounded-lg border border-[#334D40]/20 px-2 py-1 text-xs disabled:opacity-40"
                                            >
                                                ↑
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onMoveSection(section.id, "down")}
                                                disabled={index === sortedSections.length - 1}
                                                className="rounded-lg border border-[#334D40]/20 px-2 py-1 text-xs disabled:opacity-40"
                                            >
                                                ↓
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onOpenEdit(section.id)}
                                                className="rounded-lg border border-[#334D40]/20 px-2 py-1 text-xs"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onDeleteSection(section.id)}
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

                    <aside className="lg:col-span-5">
                        <div className="rounded-3xl border border-[#334D40]/15 bg-white p-4 shadow-sm">
                            <header className="mb-4 border-b border-[#334D40]/10 pb-3">
                                <h2 className="text-2xl font-semibold [font-family:var(--font-title)]">
                                    Prévia da Vitrine
                                </h2>
                                <p className="text-xs text-[#334D40]/75">
                                    Simulação da ordem e estrutura da home pública.
                                </p>
                            </header>

                            <div className="space-y-4">
                                {previewSections.length === 0 ? (
                                    <p className="text-sm text-[#334D40]/80">
                                        Ative seções para visualizar a prévia.
                                    </p>
                                ) : (
                                    previewSections.map((section) => (
                                        <article
                                            key={section.id}
                                            className="rounded-2xl border border-[#334D40]/10 bg-[#FAFAF8] p-3"
                                        >
                                            <h3 className="font-semibold">{section.name}</h3>
                                            <p className="mt-1 text-xs text-[#334D40]/70">
                                                {section.isBanner
                                                    ? "Banner principal da página"
                                                    : "Grade de produtos da seção"}
                                            </p>

                                            {section.isBanner ? (
                                                <div className="mt-3 h-20 rounded-xl border border-[#334D40]/15 bg-gradient-to-r from-[#DBD7CB] to-[#ECE9E2] px-3 py-2 text-xs">
                                                    {section.bannerImg
                                                        ? "Banner com imagem configurada"
                                                        : "Banner sem imagem definida"}
                                                </div>
                                            ) : (
                                                <div className="mt-3 grid grid-cols-2 gap-2">
                                                    <div className="h-14 rounded-lg border border-[#334D40]/15 bg-white" />
                                                    <div className="h-14 rounded-lg border border-[#334D40]/15 bg-white" />
                                                </div>
                                            )}

                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {(sectionCategories[section.id] ?? []).length === 0 ? (
                                                    <span className="rounded-full bg-[#334D40]/8 px-2 py-1 text-xs text-[#334D40]/75">
                                                        Sem categorias vinculadas
                                                    </span>
                                                ) : (
                                                    (sectionCategories[section.id] ?? []).map(
                                                        (categoryId) => (
                                                            <span
                                                                key={categoryId}
                                                                className="rounded-full bg-[#DBD7CB] px-2 py-1 text-xs"
                                                            >
                                                                {categoryMap.get(categoryId) ?? "Categoria"}
                                                            </span>
                                                        ),
                                                    )
                                                )}
                                            </div>
                                        </article>
                                    ))
                                )}
                            </div>
                        </div>
                    </aside>
                </section>
            </main>
        </div>
    );
}
