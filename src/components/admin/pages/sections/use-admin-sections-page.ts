"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminToast } from "@/src/components/admin/admin-toast";
import {
    fetchJson,
    uploadImage,
    type AdminCategory,
    type AdminSection,
} from "@/src/components/admin/admin-api";
import {
    initialSectionForm,
    type SectionCategoriesMap,
    type SectionForm,
} from "@/src/components/admin/pages/sections/section-types";
import {
    confirmDestructiveAction,
    handlePageError,
    runWithSubmittingState,
    toggleStringInList,
} from "@/src/components/admin/pages/shared/admin-page-helpers";

export function useAdminSectionsPage() {
    const [sections, setSections] = useState<AdminSection[]>([]);
    const [categories, setCategories] = useState<AdminCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sectionCategories, setSectionCategories] =
        useState<SectionCategoriesMap>({});
    const [selectedPreviewSectionId, setSelectedPreviewSectionId] =
        useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSectionId, setEditingSectionId] = useState<string | null>(
        null,
    );
    const [currentBannerImg, setCurrentBannerImg] = useState<string | null>(
        null,
    );
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
        [],
    );
    const [form, setForm] = useState<SectionForm>(initialSectionForm);
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

    const previewSections =
        activeSections.length > 0 ? activeSections : sortedSections.slice(0, 3);

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
        loadData()
            .catch((error) => {
                handlePageError({
                    error,
                    showToast,
                    toastMessage: "Falha ao carregar seções.",
                    fallbackMessage: "Falha ao carregar dados de seções.",
                    setErrorMessage,
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [loadData, showToast]);

    const resetForm = () => {
        setEditingSectionId(null);
        setCurrentBannerImg(null);
        setBannerFile(null);
        setSelectedCategoryIds([]);
        setForm({
            ...initialSectionForm,
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
            handlePageError({
                error,
                showToast,
                toastMessage: "Falha ao carregar seção para edição.",
                fallbackMessage: "Falha ao carregar seção.",
                setErrorMessage,
            });
        }
    };

    const onToggleCategory = (categoryId: string) => {
        setSelectedCategoryIds((current) => toggleStringInList(current, categoryId));
    };

    const onToggleBanner = (isBanner: boolean) => {
        setForm((current) => ({
            ...current,
            isBanner,
        }));

        if (isBanner) {
            setSelectedCategoryIds([]);
        }
    };

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage(null);
        await runWithSubmittingState(setIsSubmitting, async () => {
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
                    ? await fetchJson<AdminSection>(
                          `/api/admin/sections/${editingSectionId}`,
                          {
                              method: "PATCH",
                              body: JSON.stringify(payload),
                          },
                      )
                    : await fetchJson<AdminSection>("/api/admin/sections", {
                          method: "POST",
                          body: JSON.stringify(payload),
                      });

                await fetchJson<{ updated: true }>(
                    `/api/admin/sections/${section.id}/categories`,
                    {
                        method: "PUT",
                        body: JSON.stringify({
                            categoryIds: form.isBanner ? [] : selectedCategoryIds,
                        }),
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
                handlePageError({
                    error,
                    showToast,
                    toastMessage: "Falha ao salvar seção.",
                    fallbackMessage: "Falha ao salvar seção.",
                    setErrorMessage,
                });
            }
        });
    };

    const onDeleteSection = async (sectionId: string) => {
        const approved = confirmDestructiveAction(
            "Deseja realmente excluir esta seção?",
        );
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
            handlePageError({
                error,
                showToast,
                toastMessage: "Falha ao excluir seção.",
                fallbackMessage: "Falha ao excluir seção.",
                setErrorMessage,
            });
        }
    };

    const onMoveSection = async (sectionId: string, direction: "up" | "down") => {
        const currentIndex = sortedSections.findIndex(
            (section) => section.id === sectionId,
        );
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
            handlePageError({
                error,
                showToast,
                toastMessage: "Falha ao reordenar seções.",
                fallbackMessage: "Falha ao reordenar.",
                setErrorMessage,
            });
        }
    };

    return {
        categories,
        sectionCategories,
        selectedPreviewSectionId,
        isDialogOpen,
        editingSectionId,
        currentBannerImg,
        bannerFile,
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
    };
}
