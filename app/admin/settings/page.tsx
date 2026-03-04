"use client";

import { AdminSidebar } from "@/src/components/admin/admin-sidebar";
import { StoreConfigForm } from "@/src/components/admin/pages/settings/store-config-form";
import { useAdminSettingsPage } from "@/src/components/admin/pages/settings/use-admin-settings-page";

function SettingsSkeleton() {
    return (
        <div className="animate-pulse">
            <header className="mb-6 space-y-2">
                <div className="h-3 w-16 rounded bg-[#334D40]/10" />
                <div className="h-10 w-56 rounded bg-[#334D40]/10" />
            </header>
            <section className="w-full max-w-4xl rounded-2xl border border-[#334D40]/15 bg-white p-6 shadow-sm">
                <div className="space-y-4">
                    <div className="h-12 rounded-xl bg-[#F5F4EF]" />
                    <div className="h-12 rounded-xl bg-[#F5F4EF]" />
                    <div className="h-12 rounded-xl bg-[#F5F4EF]" />
                    <div className="h-12 rounded-xl bg-[#F5F4EF]" />
                    <div className="h-12 rounded-xl bg-[#F5F4EF]" />
                    <div className="h-11 w-36 rounded-xl bg-[#334D40]/15" />
                </div>
            </section>
        </div>
    );
}

export default function AdminSettingsPage() {
    const {
        form,
        updatedAt,
        isLoading,
        isSubmitting,
        errorMessage,
        successMessage,
        onChangeField,
        onSubmit,
    } = useAdminSettingsPage();

    return (
        <div className="min-h-screen bg-[#F5F4EF] text-[#334D40]">
            <AdminSidebar />
            <main className="px-4 py-6 sm:px-6 lg:ml-72 lg:px-10 lg:py-10">
                {isLoading ? (
                    <SettingsSkeleton />
                ) : (
                    <>
                        <header className="mb-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#334D40]/65">
                                Loja
                            </p>
                            <h1 className="mt-1 text-4xl font-semibold [font-family:var(--font-title)]">
                                Configurações
                            </h1>
                        </header>
                        <section className="w-full max-w-4xl">
                            <StoreConfigForm
                                form={form}
                                onChangeField={onChangeField}
                                onSubmit={onSubmit}
                                updatedAt={updatedAt}
                                errorMessage={errorMessage}
                                successMessage={successMessage}
                                isSubmitting={isSubmitting}
                            />
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}
