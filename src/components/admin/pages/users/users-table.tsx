"use client";

import { useMemo, useState } from "react";
import type { AdminUser } from "@/src/components/admin/admin-api";
import { isProtectedAdminEmail } from "@/src/shared/admin-users";

type UsersTableProps = {
    users: AdminUser[];
    updatingUserId: string | null;
    onRequestToggleUserStatus: (user: {
        id: string;
        name: string;
        email: string;
        isActive: boolean;
    }) => void;
};

type UserRow = {
    id: string;
    name: string;
    email: string;
    cpf: string;
    isActive: boolean;
    createdAt: Date | null;
    isProtected: boolean;
};

const ITEMS_PER_PAGE = 8;

const formatDate = (date: Date | null): string => {
    if (!date) return "Sem data";
    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(date);
};

export function UsersTable({
    users,
    updatingUserId,
    onRequestToggleUserStatus,
}: UsersTableProps) {
    const [page, setPage] = useState(1);

    const rows = useMemo<UserRow[]>(() => {
        return users
            .map((user) => ({
                id: user.id,
                name: user.name,
                email: user.email,
                cpf: user.cpf,
                isActive: user.isActive,
                createdAt: user.createdAt ? new Date(user.createdAt) : null,
                isProtected: isProtectedAdminEmail(user.email),
            }))
            .sort((a, b) => {
                if (!a.createdAt && !b.createdAt) return 0;
                if (!a.createdAt) return 1;
                if (!b.createdAt) return -1;
                return b.createdAt.getTime() - a.createdAt.getTime();
            });
    }, [users]);

    const totalPages = Math.max(1, Math.ceil(rows.length / ITEMS_PER_PAGE));
    const safePage = Math.min(page, totalPages);
    const paginatedRows = rows.slice(
        (safePage - 1) * ITEMS_PER_PAGE,
        safePage * ITEMS_PER_PAGE,
    );

    const onPreviousPage = () => {
        setPage((current) => Math.max(1, Math.min(totalPages, current - 1)));
    };

    const onNextPage = () => {
        setPage((current) => Math.max(1, Math.min(totalPages, current + 1)));
    };

    const formatCpf = (cpf: string): string => {
        const digits = cpf.replace(/\D/g, "").slice(0, 11);
        if (digits.length <= 3) return digits;
        if (digits.length <= 6)
            return `${digits.slice(0, 3)}.${digits.slice(3)}`;
        if (digits.length <= 9)
            return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
        return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(
            6,
            9,
        )}-${digits.slice(9)}`;
    };

    return (
        <section className="overflow-hidden rounded-2xl border border-[#334D40]/15 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#334D40]/10 px-5 py-4">
                <h2 className="text-xl font-semibold [font-family:var(--font-title)]">
                    Usuários cadastrados
                </h2>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#334D40]/65">
                    {rows.length} usuários
                </span>
            </div>

            {rows.length === 0 ? (
                <p className="px-5 py-6 text-sm text-[#334D40]/80">
                    Nenhum usuário cadastrado ainda.
                </p>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-[#DBD7CB]/30 text-xs uppercase tracking-[0.12em] text-[#334D40]/75">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">
                                        Nome
                                    </th>
                                    <th className="px-5 py-3 font-semibold">
                                        Email
                                    </th>
                                    <th className="px-5 py-3 font-semibold">
                                        CPF
                                    </th>
                                    <th className="px-5 py-3 font-semibold">
                                        Criado em
                                    </th>
                                    <th className="px-5 py-3 font-semibold">
                                        Status
                                    </th>
                                    <th className="px-5 py-3 font-semibold">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#334D40]/10">
                                {paginatedRows.map((row) => {
                                    const disableDeactivation =
                                        row.isProtected && row.isActive;
                                    const nextActionLabel = row.isActive
                                        ? "Desativar"
                                        : "Ativar";

                                    return (
                                        <tr key={row.id} className="bg-white">
                                            <td className="px-5 py-3 font-medium">
                                                {row.name}
                                            </td>
                                            <td className="px-5 py-3 text-[#334D40]/85">
                                                {row.email}
                                            </td>
                                            <td className="px-5 py-3 text-[#334D40]/85">
                                                {formatCpf(row.cpf)}
                                            </td>
                                            <td className="px-5 py-3 text-[#334D40]/85">
                                                {formatDate(row.createdAt)}
                                            </td>
                                            <td className="px-5 py-3">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                                        row.isActive
                                                            ? "bg-emerald-100 text-emerald-700"
                                                            : "bg-slate-100 text-slate-700"
                                                    }`}
                                                >
                                                    {row.isActive
                                                        ? "Ativo"
                                                        : "Inativo"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onRequestToggleUserStatus({
                                                            id: row.id,
                                                            name: row.name,
                                                            email: row.email,
                                                            isActive:
                                                                row.isActive,
                                                        })
                                                    }
                                                    disabled={
                                                        disableDeactivation ||
                                                        updatingUserId ===
                                                            row.id
                                                    }
                                                    className="rounded-lg border border-[#334D40]/20 px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {disableDeactivation
                                                        ? "Protegido"
                                                        : updatingUserId ===
                                                            row.id
                                                          ? "Salvando..."
                                                          : nextActionLabel}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#334D40]/10 px-5 py-3">
                        <p className="text-xs text-[#334D40]/70">
                            Página {safePage} de {totalPages}
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onPreviousPage}
                                disabled={safePage === 1}
                                className="rounded-lg border border-[#334D40]/20 px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Anterior
                            </button>
                            <button
                                type="button"
                                onClick={onNextPage}
                                disabled={safePage === totalPages}
                                className="rounded-lg border border-[#334D40]/20 px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Próxima
                            </button>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}
