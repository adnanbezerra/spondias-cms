"use client";

import { AdminSidebar } from "@/src/components/admin/admin-sidebar";
import { StoreConfigForm } from "@/src/components/admin/pages/settings/store-config-form";
import { useAdminSettingsPage } from "@/src/components/admin/pages/settings/use-admin-settings-page";

export default function AdminSettingsPage() {
    const {
        form,
        updatedAt,
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
            </main>
        </div>
    );
}
