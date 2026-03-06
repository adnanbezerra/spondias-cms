"use client";

import { useEffect, useRef, useState } from "react";
import { type AdminCategory } from "@/src/components/admin/admin-api";
import { DashboardActionDialog } from "@/src/components/admin/dashboard/dashboard-action-dialog";
import { type ProductForm } from "@/src/components/admin/dashboard/dashboard-types";

type NewProductDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: ProductForm;
    onChange: (next: ProductForm) => void;
    categories: AdminCategory[];
    selectedCategoryIds: string[];
    onToggleCategory: (categoryId: string) => void;
    currentImageUrl?: string | null;
    selectedImageFile?: File | null;
    onImageFileChange: (file: File | null) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
    isSubmitting: boolean;
    title?: string;
    description?: string;
    submitLabel?: string;
    triggerLabel?: string;
    showTrigger?: boolean;
};

const formatPriceFromCents = (valueInCents: number) => {
    const normalized = Number.isFinite(valueInCents)
        ? Math.max(0, Math.trunc(valueInCents))
        : 0;

    return (normalized / 100).toFixed(2).replace(".", ",");
};

const parseMaskedPriceToCents = (maskedValue: string) => {
    const digitsOnly = maskedValue.replace(/\D/g, "");

    if (!digitsOnly) {
        return 0;
    }

    return Number.parseInt(digitsOnly, 10);
};

export const NewProductDialog = ({
    open,
    onOpenChange,
    form,
    onChange,
    categories,
    selectedCategoryIds,
    onToggleCategory,
    currentImageUrl = null,
    selectedImageFile = null,
    onImageFileChange,
    onSubmit,
    isSubmitting,
    title = "Novo Produto",
    description = "Cadastro rápido de produto sem sair do dashboard.",
    submitLabel = "Salvar Produto",
    triggerLabel = "Adicionar Novo Produto",
    showTrigger = true,
}: NewProductDialogProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedImagePreviewUrl, setSelectedImagePreviewUrl] = useState<
        string | null
    >(null);

    useEffect(() => {
        if (!selectedImageFile) {
            setSelectedImagePreviewUrl(null);
            return;
        }

        const objectUrl = URL.createObjectURL(selectedImageFile);
        setSelectedImagePreviewUrl(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [selectedImageFile]);

    const previewImageUrl = selectedImagePreviewUrl ?? currentImageUrl;

    const openFilePicker = () => {
        fileInputRef.current?.click();
    };

    return (
        <DashboardActionDialog
            open={open}
            onOpenChange={onOpenChange}
            title={title}
            description={description}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            submitLabel={submitLabel}
            trigger={
                showTrigger ? (
                    <button
                        type="button"
                        className="cursor-pointer rounded-xl bg-[#334D40] px-5 py-3 text-sm font-semibold text-[#DBD7CB]"
                    >
                        {triggerLabel}
                    </button>
                ) : null
            }
        >
            <div className="space-y-1">
                <label className="text-sm font-medium">Nome</label>
                <input
                    value={form.name}
                    onChange={(event) =>
                        onChange({
                            ...form,
                            name: event.target.value,
                        })
                    }
                    className="w-full rounded-xl border border-[#334D40]/20 px-3 py-2"
                    required
                    minLength={2}
                />
            </div>


            <div className="space-y-1">
                <label className="text-sm font-medium">Descrição</label>
                <textarea
                    value={form.description}
                    onChange={(event) =>
                        onChange({
                            ...form,
                            description: event.target.value,
                        })
                    }
                    className="min-h-32 w-full rounded-xl border border-[#334D40]/20 px-3 py-2"
                    placeholder="Descreva detalhes do produto, cuidados, tamanhos e observações."
                />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                    <label className="text-sm font-medium">Preço</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        value={formatPriceFromCents(form.price)}
                        onChange={(event) =>
                            onChange({
                                ...form,
                                price: parseMaskedPriceToCents(
                                    event.target.value,
                                ),
                            })
                        }
                        className="w-full rounded-xl border border-[#334D40]/20 px-3 py-2"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium">Estoque</label>
                    <input
                        type="number"
                        min={0}
                        value={form.stock}
                        onChange={(event) =>
                            onChange({
                                ...form,
                                stock: Number(event.target.value),
                            })
                        }
                        className="w-full rounded-xl border border-[#334D40]/20 px-3 py-2"
                        required
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium">Desconto %</label>
                    <input
                        type="number"
                        min={0}
                        max={100}
                        value={form.discountPercentage}
                        onChange={(event) =>
                            onChange({
                                ...form,
                                discountPercentage: Number(event.target.value),
                            })
                        }
                        className="w-full rounded-xl border border-[#334D40]/20 px-3 py-2"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Imagem do produto</label>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) =>
                        onImageFileChange(event.target.files?.item(0) ?? null)
                    }
                    className="hidden"
                />

                <div
                    role="button"
                    tabIndex={0}
                    onClick={openFilePicker}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            openFilePicker();
                        }
                    }}
                    className="group relative h-44 w-full cursor-pointer overflow-hidden rounded-2xl border border-dashed border-[#334D40]/30 bg-[#F8F7F3]"
                >
                    {previewImageUrl ? (
                        <img
                            src={previewImageUrl}
                            alt="Preview da imagem do produto"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-[#334D40]/70">
                            Clique para enviar uma imagem (JPEG, PNG ou WEBP)
                        </div>
                    )}

                    <div className="pointer-events-none absolute inset-0 bg-[#0B1711]/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <div className="flex h-full items-center justify-center text-sm font-semibold text-white">
                            Editar imagem
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={openFilePicker}
                        className="rounded-lg border border-[#334D40]/20 px-3 py-1.5 text-xs font-medium text-[#334D40]"
                    >
                        {previewImageUrl
                            ? "Trocar imagem"
                            : "Selecionar imagem"}
                    </button>
                    {previewImageUrl ? (
                        <button
                            type="button"
                            onClick={() => onImageFileChange(null)}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700"
                        >
                            Remover imagem
                        </button>
                    ) : null}
                </div>

                {selectedImageFile ? (
                    <p className="text-xs text-[#334D40]/75">
                        Arquivo selecionado: {selectedImageFile.name}
                    </p>
                ) : null}
            </div>

            <label className="flex items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) =>
                        onChange({
                            ...form,
                            isActive: event.target.checked,
                        })
                    }
                />
                Produto ativo
            </label>

            <div className="space-y-2">
                <p className="text-sm font-medium">Categorias do produto</p>
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
                                    checked={selectedCategoryIds.includes(
                                        category.id,
                                    )}
                                    onChange={() =>
                                        onToggleCategory(category.id)
                                    }
                                />
                                {category.name}
                            </label>
                        ))
                    )}
                </div>
            </div>
        </DashboardActionDialog>
    );
};
