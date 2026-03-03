"use client";

import { DashboardActionDialog } from "@/src/components/admin/dashboard/dashboard-action-dialog";
import { type CategoryForm } from "@/src/components/admin/dashboard/dashboard-types";

type NewCategoryDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: CategoryForm;
    onChange: (next: CategoryForm) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
    isSubmitting: boolean;
};

export const NewCategoryDialog = ({
    open,
    onOpenChange,
    form,
    onChange,
    onSubmit,
    isSubmitting,
}: NewCategoryDialogProps) => {
    return (
        <DashboardActionDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Nova Categoria"
            description="Crie a categoria e publique na vitrine quando quiser."
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Salvar Categoria"
            trigger={
                <button
                    type="button"
                    className="rounded-xl border border-[#334D40]/20 bg-[#DBD7CB]/60 px-5 py-3 text-sm font-semibold"
                >
                    Adicionar Nova Categoria
                </button>
            }
        >
            <div className="space-y-1">
                <label className="text-sm font-medium">Nome da categoria</label>
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
                Categoria ativa
            </label>
        </DashboardActionDialog>
    );
};
