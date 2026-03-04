"use client";

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
    onImageFileChange: (file: File | null) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
    isSubmitting: boolean;
    title?: string;
    description?: string;
    submitLabel?: string;
    triggerLabel?: string;
    showTrigger?: boolean;
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
    onImageFileChange,
    onSubmit,
    isSubmitting,
    title = "Novo Produto",
    description = "Cadastro rápido de produto sem sair do dashboard.",
    submitLabel = "Salvar Produto",
    triggerLabel = "Adicionar Novo Produto",
    showTrigger = true,
}: NewProductDialogProps) => {
    return (
        <DashboardActionDialog
            open={open}
            onOpenChange={onOpenChange}
            title={title}
            description={description}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            submitLabel={submitLabel}
            trigger={showTrigger ? (
                <button
                    type="button"
                    className="cursor-pointer rounded-xl bg-[#334D40] px-5 py-3 text-sm font-semibold text-[#DBD7CB]"
                >
                    {triggerLabel}
                </button>
            ) : null}
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

            <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                    <label className="text-sm font-medium">Preço</label>
                    <input
                        type="number"
                        min={0}
                        value={form.price}
                        onChange={(event) =>
                            onChange({
                                ...form,
                                price: Number(event.target.value),
                            })
                        }
                        className="w-full rounded-xl border border-[#334D40]/20 px-3 py-2"
                        required
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

            <div className="space-y-1">
                <label className="text-sm font-medium">Imagem do produto</label>
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) =>
                        onImageFileChange(event.target.files?.item(0) ?? null)
                    }
                    className="w-full rounded-xl border border-[#334D40]/20 px-3 py-2"
                />
                {currentImageUrl ? (
                    <p className="text-xs text-[#334D40]/75 break-all">
                        Imagem atual: {currentImageUrl}
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
                                    onChange={() => onToggleCategory(category.id)}
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
