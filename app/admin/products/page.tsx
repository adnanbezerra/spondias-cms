"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminSidebar } from "@/src/components/admin/admin-sidebar";
import {
    fetchJson,
    uploadImage,
    type AdminProduct,
    type AdminSection,
} from "@/src/components/admin/admin-api";
import { NewProductDialog } from "@/src/components/admin/dashboard/new-product-dialog";
import {
    initialProductForm,
    type ProductForm,
} from "@/src/components/admin/dashboard/dashboard-types";
import { useAdminToast } from "@/src/components/admin/admin-toast";

export default function AdminProductsPage() {
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [sections, setSections] = useState<AdminSection[]>([]);
    const [form, setForm] = useState<ProductForm>(initialProductForm);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
    const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);
    const [editingProductId, setEditingProductId] = useState<string | null>(
        null,
    );
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { showToast } = useAdminToast();

    const loadData = useCallback(async () => {
        const [productsPayload, sectionsPayload] = await Promise.all([
            fetchJson<AdminProduct[]>("/api/admin/products"),
            fetchJson<AdminSection[]>("/api/admin/sections"),
        ]);

        setProducts(productsPayload);
        setSections(sectionsPayload.filter((section) => section.isActive));
    }, []);

    useEffect(() => {
        loadData().catch(() => {
            setErrorMessage("Falha ao carregar dados de produtos.");
            showToast("Falha ao carregar dados de produtos.", { variant: "error" });
        });
    }, [loadData, showToast]);

    const resetForm = () => {
        setForm(initialProductForm);
        setImageFile(null);
        setCurrentImageUrl(null);
        setSelectedSectionIds([]);
        setEditingProductId(null);
    };

    const onOpenCreate = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    const onEditProduct = async (productId: string) => {
        setErrorMessage(null);

        try {
            const [product, relation] = await Promise.all([
                fetchJson<AdminProduct>(`/api/admin/products/${productId}`),
                fetchJson<{ sectionIds: string[] }>(
                    `/api/admin/products/${productId}/sections`,
                ),
            ]);

            setEditingProductId(product.id);
            setForm({
                name: product.name,
                price: product.price,
                stock: product.stock,
                discountPercentage: product.discountPercentage,
                isActive: product.isActive,
            });
            setCurrentImageUrl(product.image);
            setImageFile(null);
            setSelectedSectionIds(relation.sectionIds);
            setIsDialogOpen(true);
        } catch (error) {
            showToast("Falha ao carregar produto para edição.", {
                variant: "error",
            });
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Falha ao carregar produto.",
            );
        }
    };

    const onToggleSection = (sectionId: string) => {
        setSelectedSectionIds((current) =>
            current.includes(sectionId)
                ? current.filter((item) => item !== sectionId)
                : [...current, sectionId],
        );
    };

    const onSubmitProduct = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();
        setErrorMessage(null);
        setIsSubmitting(true);

        try {
            let imageUrl = currentImageUrl;
            if (imageFile) {
                const upload = await uploadImage(imageFile);
                imageUrl = upload.url;
            }

            const payload = {
                ...form,
                image: imageUrl,
            };

            const product = editingProductId
                ? await fetchJson<AdminProduct>(
                    `/api/admin/products/${editingProductId}`,
                    {
                        method: "PATCH",
                        body: JSON.stringify(payload),
                    },
                )
                : await fetchJson<AdminProduct>("/api/admin/products", {
                    method: "POST",
                    body: JSON.stringify(payload),
                });

            await fetchJson<{ updated: true }>(
                `/api/admin/products/${product.id}/sections`,
                {
                    method: "PUT",
                    body: JSON.stringify({
                        sectionIds: selectedSectionIds,
                    }),
                },
            );

            setIsDialogOpen(false);
            resetForm();
            await loadData();
            showToast(
                editingProductId
                    ? "Produto atualizado com sucesso."
                    : "Produto criado com sucesso.",
                { variant: "success" },
            );
        } catch (error) {
            showToast("Falha ao salvar produto.", { variant: "error" });
            setErrorMessage(
                error instanceof Error ? error.message : "Falha ao salvar produto.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const onDeleteProduct = async (productId: string) => {
        const approved = window.confirm("Deseja realmente excluir este produto?");
        if (!approved) return;

        try {
            await fetchJson<{ deleted: true }>(`/api/admin/products/${productId}`, {
                method: "DELETE",
            });
            showToast("Produto excluído com sucesso.", { variant: "success" });

            if (editingProductId === productId) {
                resetForm();
            }
            await loadData();
        } catch (error) {
            showToast("Falha ao excluir produto.", { variant: "error" });
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Falha ao excluir produto.",
            );
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F4EF] text-[#334D40]">
            <AdminSidebar />
            <main className="px-4 py-6 sm:px-6 lg:ml-72 lg:px-10 lg:py-10">
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
                    sections={sections}
                    selectedSectionIds={selectedSectionIds}
                    onToggleSection={onToggleSection}
                    currentImageUrl={currentImageUrl}
                    onImageFileChange={setImageFile}
                    onSubmit={onSubmitProduct}
                    isSubmitting={isSubmitting}
                    showTrigger={false}
                    title={editingProductId ? "Editar Produto" : "Novo Produto"}
                    description={
                        editingProductId
                            ? "Atualize os dados do produto selecionado."
                            : "Cadastro rápido de produto sem sair da página."
                    }
                    submitLabel={
                        editingProductId ? "Salvar Alterações" : "Salvar Produto"
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
                        {products.length === 0 ? (
                            <p className="text-sm text-[#334D40]/80">
                                Nenhum produto cadastrado.
                            </p>
                        ) : (
                            products.map((product) => (
                                <article
                                    key={product.id}
                                    className="rounded-xl border border-[#334D40]/15 bg-white p-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-semibold">
                                                {product.name}
                                            </p>
                                            <p className="text-xs text-[#334D40]/75">
                                                Preço: {product.price} centavos
                                                {" · "}
                                                Estoque: {product.stock}
                                            </p>
                                            <p className="text-xs text-[#334D40]/75">
                                                Desconto: {product.discountPercentage}%{" · "}
                                                {product.isActive
                                                    ? "Ativo"
                                                    : "Inativo"}
                                            </p>
                                            {product.image ? (
                                                <p className="mt-1 text-xs text-[#334D40]/75 break-all">
                                                    Imagem: {product.image}
                                                </p>
                                            ) : null}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onEditProduct(product.id)
                                                }
                                                className="rounded-lg border border-[#334D40]/20 px-2 py-1 text-xs"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onDeleteProduct(product.id)
                                                }
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
                </section>
            </main>
        </div>
    );
}
