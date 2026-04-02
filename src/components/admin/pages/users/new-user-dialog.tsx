"use client";

import { DashboardActionDialog } from "@/src/components/admin/dashboard/dashboard-action-dialog";
import type { UserForm } from "@/src/components/admin/pages/users/user-types";

type NewUserDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: UserForm;
    onChange: (next: UserForm) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
    isSubmitting: boolean;
};

export const NewUserDialog = ({
    open,
    onOpenChange,
    form,
    onChange,
    onSubmit,
    isSubmitting,
}: NewUserDialogProps) => {
    const formatCpf = (digits: string): string => {
        const limited = digits.slice(0, 11);
        const part1 = limited.slice(0, 3);
        const part2 = limited.slice(3, 6);
        const part3 = limited.slice(6, 9);
        const part4 = limited.slice(9, 11);

        if (limited.length <= 3) return part1;
        if (limited.length <= 6) return `${part1}.${part2}`;
        if (limited.length <= 9) return `${part1}.${part2}.${part3}`;
        return `${part1}.${part2}.${part3}-${part4}`;
    };

    return (
        <DashboardActionDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Novo Usuário"
            description="Cadastre um novo usuário administrador."
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Salvar Usuário"
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
                <label className="text-sm font-medium">Email</label>
                <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                        onChange({
                            ...form,
                            email: event.target.value,
                        })
                    }
                    className="w-full rounded-xl border border-[#334D40]/20 px-3 py-2"
                    required
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium">CPF</label>
                <input
                    value={formatCpf(form.cpf)}
                    onChange={(event) =>
                        onChange({
                            ...form,
                            cpf: event.target.value.replace(/\D/g, "").slice(0, 11),
                        })
                    }
                    className="w-full rounded-xl border border-[#334D40]/20 px-3 py-2"
                    placeholder="000.000.000-00"
                    required
                    minLength={11}
                    maxLength={14}
                    inputMode="numeric"
                    pattern="[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}"
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium">Senha</label>
                <input
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                        onChange({
                            ...form,
                            password: event.target.value,
                        })
                    }
                    className="w-full rounded-xl border border-[#334D40]/20 px-3 py-2"
                    required
                    minLength={8}
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
                Usuário ativo
            </label>
        </DashboardActionDialog>
    );
};
