"use client";

import { AdminSidebar } from "@/src/components/admin/admin-sidebar";
import { NewUserDialog } from "@/src/components/admin/pages/users/new-user-dialog";
import { UserStatusDialog } from "@/src/components/admin/pages/users/user-status-dialog";
import { useAdminUsersPage } from "@/src/components/admin/pages/users/use-admin-users-page";
import { UsersTable } from "@/src/components/admin/pages/users/users-table";

function UsersSkeleton() {
    return (
        <div className="animate-pulse">
            <header className="mb-6 flex items-end justify-between gap-4">
                <div className="space-y-2">
                    <div className="h-3 w-24 rounded bg-[#334D40]/10" />
                    <div className="h-10 w-44 rounded bg-[#334D40]/10" />
                </div>
                <div className="h-12 w-52 rounded-xl bg-[#334D40]/10" />
            </header>

            <section className="rounded-2xl border border-[#334D40]/15 bg-white p-5 shadow-sm">
                <div className="h-7 w-56 rounded bg-[#334D40]/10" />
                <div className="mt-4 space-y-3">
                    <div className="h-16 rounded-xl bg-[#F5F4EF]" />
                    <div className="h-16 rounded-xl bg-[#F5F4EF]" />
                    <div className="h-16 rounded-xl bg-[#F5F4EF]" />
                </div>
            </section>
        </div>
    );
}

export default function AdminUsersPage() {
    const {
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
    } = useAdminUsersPage();

    return (
        <div className="min-h-screen bg-[#F5F4EF] text-[#334D40]">
            <AdminSidebar />

            <main className="px-4 py-6 sm:px-6 lg:ml-72 lg:px-10 lg:py-10">
                {isLoading ? (
                    <UsersSkeleton />
                ) : (
                    <>
                        <header className="mb-6 flex items-end justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#334D40]/65">
                                    Administração
                                </p>
                                <h1 className="mt-1 text-4xl font-semibold [font-family:var(--font-title)]">
                                    Usuários
                                </h1>
                            </div>

                            <button
                                type="button"
                                onClick={onOpenCreate}
                                className="cursor-pointer rounded-xl bg-[#334D40] px-5 py-3 text-sm font-semibold text-[#DBD7CB]"
                            >
                                Adicionar Novo Usuário
                            </button>
                        </header>

                        <NewUserDialog
                            open={isDialogOpen}
                            onOpenChange={setIsDialogOpen}
                            form={form}
                            onChange={setForm}
                            onSubmit={onSubmit}
                            isSubmitting={isSubmitting}
                        />

                        <UserStatusDialog
                            open={Boolean(pendingStatusChange)}
                            onOpenChange={(open) => {
                                if (!open) {
                                    onCancelToggleUserStatus();
                                }
                            }}
                            userName={pendingStatusChange?.name ?? ""}
                            nextIsActive={pendingStatusChange?.isActive === false}
                            isSubmitting={updatingUserId !== null}
                            onConfirm={onConfirmToggleUserStatus}
                        />

                        <UsersTable
                            users={users}
                            updatingUserId={updatingUserId}
                            onRequestToggleUserStatus={onRequestToggleUserStatus}
                        />
                    </>
                )}
            </main>
        </div>
    );
}
