"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminSidebar } from "@/src/components/admin/admin-sidebar";
import {
    fetchJson,
    type AdminCategory,
    type AdminProduct,
    type AdminSection,
} from "@/src/components/admin/admin-api";
import { useAdminToast } from "@/src/components/admin/admin-toast";
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

type CategoryForm = {
    name: string;
    isActive: boolean;
};

type ProductForm = {
    name: string;
    price: number;
    stock: number;
    discountPercentage: number;
    image: string;
    isActive: boolean;
};

const initialCategoryForm: CategoryForm = {
    name: "",
    isActive: true,
};

const initialProductForm: ProductForm = {
    name: "",
    price: 0,
    stock: 0,
    discountPercentage: 0,
    image: "",
    isActive: true,
};

export default function AdminDashboardPage() {
    const [categories, setCategories] = useState<AdminCategory[]>([]);
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [sections, setSections] = useState<AdminSection[]>([]);
    const [categoryForm, setCategoryForm] =
        useState<CategoryForm>(initialCategoryForm);
    const [productForm, setProductForm] =
        useState<ProductForm>(initialProductForm);
    const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
    const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);
    const [isProductSubmitting, setIsProductSubmitting] = useState(false);
    const { showToast } = useAdminToast();

    const loadData = async () => {
        const [categoriesPayload, productsPayload, sectionsPayload] =
            await Promise.all([
                fetchJson<AdminCategory[]>("/api/admin/categories"),
                fetchJson<AdminProduct[]>("/api/admin/products"),
                fetchJson<AdminSection[]>("/api/admin/sections"),
            ]);

        setCategories(categoriesPayload);
        setProducts(productsPayload);
        setSections(sectionsPayload.filter((section) => section.isActive));
    };

    useEffect(() => {
        loadData().catch(() => {
            showToast("Falha ao carregar o dashboard.", { variant: "error" });
        });
    }, [showToast]);

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

    const onToggleSection = (sectionId: string) => {
        setSelectedSectionIds((current) =>
            current.includes(sectionId)
                ? current.filter((id) => id !== sectionId)
                : [...current, sectionId],
        );
    };

    const onSubmitProduct = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsProductSubmitting(true);

        try {
            const createdProduct = await fetchJson<AdminProduct>(
                "/api/admin/products",
                {
                    method: "POST",
                    body: JSON.stringify({
                        ...productForm,
                        image: productForm.image.trim()
                            ? productForm.image.trim()
                            : null,
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
                    <Dialog
                        open={isProductDialogOpen}
                        onOpenChange={setIsProductDialogOpen}
                    >
                        <DialogTrigger asChild>
                            <button
                                type="button"
                                className="rounded-xl bg-[#334D40] px-5 py-3 text-sm font-semibold text-[#DBD7CB]"
                            >
                                Adicionar Novo Produto
                            </button>
                        </DialogTrigger>
                        <DialogOverlay />
                        <DialogContent>
                            <form onSubmit={onSubmitProduct}>
                                <DialogHeader>
                                    <DialogTitle>Novo Produto</DialogTitle>
                                    <DialogDescription>
                                        Cadastro rápido de produto sem sair do
                                        dashboard.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 px-6 py-5">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">
                                            Nome
                                        </label>
                                        <input
                                            value={productForm.name}
                                            onChange={(event) =>
                                                setProductForm((current) => ({
                                                    ...current,
                                                    name: event.target.value,
                                                }))
                                            }
                                            className="w-full rounded-xl border border-[#334D40]/20 px-3 py-2"
                                            required
                                            minLength={2}
                                        />
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-3">
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium">
                                                Preço
                                            </label>
                                            <input
                                                type="number"
                                                min={0}
                                                value={productForm.price}
                                                onChange={(event) =>
                                                    setProductForm(
                                                        (current) => ({
                                                            ...current,
                                                            price: Number(
                                                                event.target
                                                                    .value,
                                                            ),
                                                        }),
                                                    )
                                                }
                                                className="w-full rounded-xl border border-[#334D40]/20 px-3 py-2"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium">
                                                Estoque
                                            </label>
                                            <input
                                                type="number"
                                                min={0}
                                                value={productForm.stock}
                                                onChange={(event) =>
                                                    setProductForm(
                                                        (current) => ({
                                                            ...current,
                                                            stock: Number(
                                                                event.target
                                                                    .value,
                                                            ),
                                                        }),
                                                    )
                                                }
                                                className="w-full rounded-xl border border-[#334D40]/20 px-3 py-2"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium">
                                                Desconto %
                                            </label>
                                            <input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={
                                                    productForm.discountPercentage
                                                }
                                                onChange={(event) =>
                                                    setProductForm(
                                                        (current) => ({
                                                            ...current,
                                                            discountPercentage:
                                                                Number(
                                                                    event.target
                                                                        .value,
                                                                ),
                                                        }),
                                                    )
                                                }
                                                className="w-full rounded-xl border border-[#334D40]/20 px-3 py-2"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">
                                            URL da imagem
                                        </label>
                                        <input
                                            type="url"
                                            placeholder="https://..."
                                            value={productForm.image}
                                            onChange={(event) =>
                                                setProductForm((current) => ({
                                                    ...current,
                                                    image: event.target.value,
                                                }))
                                            }
                                            className="w-full rounded-xl border border-[#334D40]/20 px-3 py-2"
                                        />
                                    </div>

                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={productForm.isActive}
                                            onChange={(event) =>
                                                setProductForm((current) => ({
                                                    ...current,
                                                    isActive:
                                                        event.target.checked,
                                                }))
                                            }
                                        />
                                        Produto ativo
                                    </label>

                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">
                                            Seções do produto
                                        </p>
                                        <div className="max-h-32 space-y-1 overflow-y-auto rounded-xl border border-[#334D40]/15 p-2">
                                            {sections.length === 0 ? (
                                                <p className="text-sm text-[#334D40]/75">
                                                    Cadastre seções antes de
                                                    vincular.
                                                </p>
                                            ) : (
                                                sections.map((section) => (
                                                    <label
                                                        key={section.id}
                                                        className="flex items-center gap-2 text-sm"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedSectionIds.includes(
                                                                section.id,
                                                            )}
                                                            onChange={() =>
                                                                onToggleSection(
                                                                    section.id,
                                                                )
                                                            }
                                                        />
                                                        {section.name}
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
                                            className="rounded-xl border border-[#334D40]/20 px-4 py-2 text-sm"
                                        >
                                            Cancelar
                                        </button>
                                    </DialogClose>
                                    <button
                                        type="submit"
                                        disabled={isProductSubmitting}
                                        className="rounded-xl bg-[#334D40] px-4 py-2 text-sm font-semibold text-[#DBD7CB] disabled:opacity-60"
                                    >
                                        {isProductSubmitting
                                            ? "Salvando..."
                                            : "Salvar Produto"}
                                    </button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog
                        open={isCategoryDialogOpen}
                        onOpenChange={setIsCategoryDialogOpen}
                    >
                        <DialogTrigger asChild>
                            <button
                                type="button"
                                className="rounded-xl border border-[#334D40]/20 bg-[#DBD7CB]/60 px-5 py-3 text-sm font-semibold"
                            >
                                Adicionar Nova Categoria
                            </button>
                        </DialogTrigger>
                        <DialogOverlay />
                        <DialogContent>
                            <form onSubmit={onSubmitCategory}>
                                <DialogHeader>
                                    <DialogTitle>Nova Categoria</DialogTitle>
                                    <DialogDescription>
                                        Crie a categoria e publique na vitrine
                                        quando quiser.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 px-6 py-5">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">
                                            Nome da categoria
                                        </label>
                                        <input
                                            value={categoryForm.name}
                                            onChange={(event) =>
                                                setCategoryForm((current) => ({
                                                    ...current,
                                                    name: event.target.value,
                                                }))
                                            }
                                            className="w-full rounded-xl border border-[#334D40]/20 px-3 py-2"
                                            required
                                            minLength={2}
                                        />
                                    </div>

                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={categoryForm.isActive}
                                            onChange={(event) =>
                                                setCategoryForm((current) => ({
                                                    ...current,
                                                    isActive:
                                                        event.target.checked,
                                                }))
                                            }
                                        />
                                        Categoria ativa
                                    </label>
                                </div>

                                <DialogFooter>
                                    <DialogClose asChild>
                                        <button
                                            type="button"
                                            className="rounded-xl border border-[#334D40]/20 px-4 py-2 text-sm"
                                        >
                                            Cancelar
                                        </button>
                                    </DialogClose>
                                    <button
                                        type="submit"
                                        disabled={isCategorySubmitting}
                                        className="rounded-xl bg-[#334D40] px-4 py-2 text-sm font-semibold text-[#DBD7CB] disabled:opacity-60"
                                    >
                                        {isCategorySubmitting
                                            ? "Salvando..."
                                            : "Salvar Categoria"}
                                    </button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </section>

                <section className="mt-8 grid gap-4 lg:grid-cols-3">
                    <article className="rounded-2xl border border-[#334D40]/15 bg-white/85 p-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold [font-family:var(--font-title)]">
                                Produtos
                            </h2>
                            <Link
                                href="/admin/products"
                                className="text-xs font-semibold uppercase tracking-[0.1em] text-[#334D40]/70"
                            >
                                gerenciar
                            </Link>
                        </div>
                        <p className="mt-3 text-3xl font-semibold">
                            {products.length}
                        </p>
                        <p className="mt-1 text-xs text-[#334D40]/75">
                            produtos cadastrados
                        </p>
                    </article>

                    <article className="rounded-2xl border border-[#334D40]/15 bg-white/85 p-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold [font-family:var(--font-title)]">
                                Categorias
                            </h2>
                            <Link
                                href="/admin/categories"
                                className="text-xs font-semibold uppercase tracking-[0.1em] text-[#334D40]/70"
                            >
                                gerenciar
                            </Link>
                        </div>
                        <p className="mt-3 text-3xl font-semibold">
                            {categories.length}
                        </p>
                        <p className="mt-1 text-xs text-[#334D40]/75">
                            categorias cadastradas
                        </p>
                    </article>

                    <article className="rounded-2xl border border-[#334D40]/15 bg-white/85 p-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold [font-family:var(--font-title)]">
                                Seções
                            </h2>
                            <Link
                                href="/admin/sections"
                                className="text-xs font-semibold uppercase tracking-[0.1em] text-[#334D40]/70"
                            >
                                gerenciar
                            </Link>
                        </div>
                        <p className="mt-3 text-3xl font-semibold">
                            {sections.length}
                        </p>
                        <p className="mt-1 text-xs text-[#334D40]/75">
                            seções ativas na vitrine
                        </p>
                    </article>
                </section>
            </main>
        </div>
    );
}
