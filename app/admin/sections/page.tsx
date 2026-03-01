"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminNav } from "@/src/components/admin/admin-nav";
import { useAdminToast } from "@/src/components/admin/admin-toast";
import { fetchJson, uploadImage, type AdminCategory, type AdminSection } from "@/src/components/admin/admin-api";

export default function AdminSectionsPage() {
    const [sections, setSections] = useState<AdminSection[]>([]);
    const [categories, setCategories] = useState<AdminCategory[]>([]);
    const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
    const [currentBannerImg, setCurrentBannerImg] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [order, setOrder] = useState<number>(1);
    const [isActive, setIsActive] = useState(true);
    const [isBanner, setIsBanner] = useState(false);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { showToast } = useAdminToast();

    const sortedSections = useMemo(
        () => [...sections].sort((a, b) => a.order - b.order),
        [sections],
    );

    const loadData = async () => {
        const [sectionsPayload, categoriesPayload] = await Promise.all([
            fetchJson<AdminSection[]>("/api/admin/sections"),
            fetchJson<AdminCategory[]>("/api/admin/categories"),
        ]);

        setSections(sectionsPayload);
        setCategories(categoriesPayload.filter((category) => category.isActive));
    };

    useEffect(() => {
        loadData().catch(() => {
            setErrorMessage("Falha ao carregar dados de seções.");
            showToast("Falha ao carregar dados de seções.", { variant: "error" });
        });
    }, [showToast]);

    const resetForm = () => {
        setEditingSectionId(null);
        setCurrentBannerImg(null);
        setName("");
        setOrder(1);
        setIsActive(true);
        setIsBanner(false);
        setBannerFile(null);
        setSelectedCategoryIds([]);
    };

    const onEditSection = async (sectionId: string) => {
        setErrorMessage(null);

        try {
            const [section, relation] = await Promise.all([
                fetchJson<AdminSection>(`/api/admin/sections/${sectionId}`),
                fetchJson<{ categoryIds: string[] }>(`/api/admin/sections/${sectionId}/categories`),
            ]);

            setEditingSectionId(section.id);
            setCurrentBannerImg(section.bannerImg);
            setName(section.name);
            setOrder(section.order);
            setIsActive(section.isActive);
            setIsBanner(section.isBanner);
            setBannerFile(null);
            setSelectedCategoryIds(relation.categoryIds);
        } catch (error) {
            showToast("Falha ao carregar seção para edição.", { variant: "error" });
            setErrorMessage(error instanceof Error ? error.message : "Falha ao carregar seção.");
        }
    };

    const onToggleCategory = (categoryId: string) => {
        setSelectedCategoryIds((current) =>
            current.includes(categoryId)
                ? current.filter((item) => item !== categoryId)
                : [...current, categoryId],
        );
    };

    const onSubmitSection = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage(null);
        setIsSubmitting(true);

        try {
            let bannerImg = currentBannerImg;
            if (isBanner && bannerFile) {
                const upload = await uploadImage(bannerFile);
                bannerImg = upload.url;
            }
            if (!isBanner) {
                bannerImg = null;
            }

            const sectionPayload = { name, order, isActive, isBanner, bannerImg };

            const section = editingSectionId
                ? await fetchJson<AdminSection>(`/api/admin/sections/${editingSectionId}`, {
                    method: "PATCH",
                    body: JSON.stringify(sectionPayload),
                })
                : await fetchJson<AdminSection>("/api/admin/sections", {
                    method: "POST",
                    body: JSON.stringify(sectionPayload),
                });

            await fetchJson<{ updated: true }>(`/api/admin/sections/${section.id}/categories`, {
                method: "PUT",
                body: JSON.stringify({
                    categoryIds: selectedCategoryIds,
                }),
            });

            resetForm();
            await loadData();
            showToast(
                editingSectionId ? "Seção atualizada com sucesso." : "Seção criada com sucesso.",
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
            showToast("Seção excluída com sucesso.", { variant: "success" });
            if (editingSectionId === sectionId) {
                resetForm();
            }
            await loadData();
        } catch (error) {
            showToast("Falha ao excluir seção.", { variant: "error" });
            setErrorMessage(error instanceof Error ? error.message : "Falha ao excluir seção.");
        }
    };

    return (
        <main>
            <AdminNav />
            <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr,1.2fr]">
                <form
                    onSubmit={onSubmitSection}
                    className="space-y-4 rounded-2xl border border-[#334D40]/15 bg-white/80 p-5 shadow-sm"
                >
                    <h1 className="text-2xl font-semibold [font-family:var(--font-title)]">
                        {editingSectionId ? "Editar seção" : "Nova seção"}
                    </h1>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Nome</label>
                        <input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="w-full rounded-xl border border-[#334D40]/20 bg-white px-3 py-2"
                            required
                            minLength={2}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Ordem</label>
                        <input
                            type="number"
                            value={order}
                            onChange={(event) => setOrder(Number(event.target.value))}
                            className="w-full rounded-xl border border-[#334D40]/20 bg-white px-3 py-2"
                            required
                            min={0}
                        />
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(event) => setIsActive(event.target.checked)}
                        />
                        Seção ativa
                    </label>

                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={isBanner}
                            onChange={(event) => setIsBanner(event.target.checked)}
                        />
                        Seção de banner
                    </label>

                    {isBanner ? (
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Imagem do banner</label>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(event) =>
                                    setBannerFile(event.target.files?.item(0) ?? null)
                                }
                                className="w-full rounded-xl border border-[#334D40]/20 bg-white px-3 py-2"
                            />
                            {currentBannerImg ? (
                                <p className="text-xs text-[#334D40]/75 break-all">
                                    Imagem atual: {currentBannerImg}
                                </p>
                            ) : null}
                        </div>
                    ) : null}

                    <div className="space-y-2">
                        <p className="text-sm font-medium">Categorias da seção</p>
                        <div className="max-h-36 space-y-1 overflow-y-auto rounded-xl border border-[#334D40]/15 bg-white p-2">
                            {categories.length === 0 ? (
                                <p className="text-sm text-[#334D40]/75">
                                    Cadastre categorias antes de criar vínculos.
                                </p>
                            ) : (
                                categories.map((category) => (
                                    <label key={category.id} className="flex items-center gap-2 text-sm">
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

                    {errorMessage ? (
                        <p className="rounded-xl bg-red-100 px-3 py-2 text-sm text-red-800">
                            {errorMessage}
                        </p>
                    ) : null}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-xl bg-[#334D40] px-4 py-2 font-semibold text-[#DBD7CB] disabled:opacity-70"
                    >
                        {isSubmitting
                            ? "Salvando..."
                            : editingSectionId
                                ? "Salvar alterações"
                                : "Criar seção"}
                    </button>
                    {editingSectionId ? (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="ml-2 rounded-xl border border-[#334D40]/20 px-4 py-2 text-sm"
                        >
                            Cancelar edição
                        </button>
                    ) : null}
                </form>

                <div className="space-y-3 rounded-2xl border border-[#334D40]/15 bg-white/80 p-5 shadow-sm">
                    <h2 className="text-xl font-semibold [font-family:var(--font-title)]">
                        Seções cadastradas
                    </h2>
                    {sortedSections.length === 0 ? (
                        <p className="text-sm text-[#334D40]/80">Nenhuma seção cadastrada.</p>
                    ) : (
                        sortedSections.map((section) => (
                            <article
                                key={section.id}
                                className="rounded-xl border border-[#334D40]/15 bg-white p-3"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-semibold">{section.name}</p>
                                        <p className="text-xs text-[#334D40]/75">Ordem: {section.order}</p>
                                        <p className="text-xs text-[#334D40]/75">
                                            {section.isBanner ? "Banner" : "Seção comum"} ·{" "}
                                            {section.isActive ? "Ativa" : "Inativa"}
                                        </p>
                                        {section.bannerImg ? (
                                            <p className="mt-1 text-xs text-[#334D40]/75 break-all">
                                                Imagem: {section.bannerImg}
                                            </p>
                                        ) : null}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onEditSection(section.id)}
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
                            </article>
                        ))
                    )}
                </div>
            </section>
        </main>
    );
}
