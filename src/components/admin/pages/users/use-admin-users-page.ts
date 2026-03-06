"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchJson, type AdminUser } from "@/src/components/admin/admin-api";
import { useAdminToast } from "@/src/components/admin/admin-toast";
import {
    getErrorMessage,
    handlePageError,
    runWithSubmittingState,
} from "@/src/components/admin/pages/shared/admin-page-helpers";
import {
    initialUserForm,
    type UserForm,
} from "@/src/components/admin/pages/users/user-types";
import { isProtectedAdminEmail } from "@/src/shared/admin-users";

export function useAdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [form, setForm] = useState<UserForm>(initialUserForm);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
    const [pendingStatusChange, setPendingStatusChange] = useState<{
        id: string;
        name: string;
        email: string;
        isActive: boolean;
    } | null>(null);
    const { showToast } = useAdminToast();

    const loadUsers = useCallback(async () => {
        const payload = await fetchJson<AdminUser[]>("/api/admin/users");
        setUsers(payload);
    }, []);

    useEffect(() => {
        loadUsers()
            .catch((error) => {
                handlePageError({
                    error,
                    showToast,
                    toastMessage: "Falha ao carregar usuários.",
                    fallbackMessage: "Falha ao carregar usuários.",
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [loadUsers, showToast]);

    const resetForm = () => {
        setForm(initialUserForm);
    };

    const onOpenCreate = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        await runWithSubmittingState(setIsSubmitting, async () => {
            try {
                await fetchJson<AdminUser>("/api/admin/users", {
                    method: "POST",
                    body: JSON.stringify({
                        ...form,
                        email: form.email.trim().toLowerCase(),
                        cpf: form.cpf.replace(/\D/g, ""),
                    }),
                });

                setIsDialogOpen(false);
                resetForm();
                await loadUsers();
                showToast("Usuário criado com sucesso.", {
                    variant: "success",
                });
            } catch (error) {
                showToast(getErrorMessage(error, "Falha ao criar usuário."), {
                    variant: "error",
                    durationMs: 5000,
                });
            }
        });
    };

    const onRequestToggleUserStatus = (user: {
        id: string;
        name: string;
        email: string;
        isActive: boolean;
    }) => {
        const nextStatus = !user.isActive;

        if (!nextStatus && isProtectedAdminEmail(user.email)) {
            showToast(
                "Não é permitido desativar o usuário adnanbezerra@proton.me.",
                { variant: "error" },
            );
            return;
        }

        setPendingStatusChange(user);
    };

    const onCancelToggleUserStatus = () => {
        setPendingStatusChange(null);
    };

    const onConfirmToggleUserStatus = async () => {
        if (!pendingStatusChange) return;
        const nextStatus = !pendingStatusChange.isActive;

        try {
            setUpdatingUserId(pendingStatusChange.id);
            await fetchJson<AdminUser>(
                `/api/admin/users/${pendingStatusChange.id}`,
                {
                method: "PATCH",
                body: JSON.stringify({ isActive: nextStatus }),
                },
            );
            await loadUsers();
            setPendingStatusChange(null);
            showToast(
                nextStatus
                    ? "Usuário ativado com sucesso."
                    : "Usuário desativado com sucesso.",
                {
                    variant: "success",
                },
            );
        } catch (error) {
            handlePageError({
                error,
                showToast,
                toastMessage: "Falha ao atualizar status do usuário.",
                fallbackMessage: "Falha ao atualizar status do usuário.",
            });
        } finally {
            setUpdatingUserId(null);
        }
    };

    return {
        users,
        form,
        isLoading,
        isDialogOpen,
        isSubmitting,
        updatingUserId,
        pendingStatusChange,
        setForm,
        setIsDialogOpen,
        onOpenCreate,
        onSubmit,
        onRequestToggleUserStatus,
        onCancelToggleUserStatus,
        onConfirmToggleUserStatus,
    };
}
