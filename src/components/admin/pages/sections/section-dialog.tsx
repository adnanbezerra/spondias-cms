"use client";

import type { AdminCategory } from "@/src/components/admin/admin-api";
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
import type { SectionForm } from "./section-types";

type SectionDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onOpenCreate: () => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
    onResetForm: () => void;
    editingSectionId: string | null;
    form: SectionForm;
    onChangeForm: (updater: (current: SectionForm) => SectionForm) => void;
    categories: AdminCategory[];
    selectedCategoryIds: string[];
    onToggleCategory: (categoryId: string) => void;
    onToggleBanner: (isBanner: boolean) => void;
    onBannerFileChange: (file: File | null) => void;
    currentBannerImg: string | null;
    isSubmitting: boolean;
};

export function SectionDialog({
    open,
    onOpenChange,
    onOpenCreate,
    onSubmit,
    onResetForm,
    editingSectionId,
    form,
    onChangeForm,
    categories,
    selectedCategoryIds,
    onToggleCategory,
    onToggleBanner,
    onBannerFileChange,
    currentBannerImg,
    isSubmitting,
}: SectionDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                                    onChangeForm((current) => ({
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
                                    onChangeForm((current) => ({
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
                                    onChangeForm((current) => ({
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
                                    onToggleBanner(event.target.checked)
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
                                        onBannerFileChange(
                                            event.target.files?.item(0) ?? null,
                                        )
                                    }
                                    className="w-full rounded-xl border border-[#334D40]/20 px-3 py-2"
                                />
                                {currentBannerImg ? (
                                    <p className="break-all text-xs text-[#334D40]/70">
                                        Imagem atual: {currentBannerImg}
                                    </p>
                                ) : null}
                            </div>
                        ) : null}

                        {!form.isBanner ? (
                            <div className="space-y-2">
                                <p className="text-sm font-medium">
                                    Categorias da seção
                                </p>
                                <div className="max-h-32 space-y-1 overflow-y-auto rounded-xl border border-[#334D40]/15 p-2">
                                    {categories.length === 0 ? (
                                        <p className="text-sm text-[#334D40]/75">
                                            Cadastre categorias antes de
                                            vincular.
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
                                                        onToggleCategory(
                                                            category.id,
                                                        )
                                                    }
                                                />
                                                {category.name}
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <button
                                type="button"
                                onClick={onResetForm}
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
    );
}
