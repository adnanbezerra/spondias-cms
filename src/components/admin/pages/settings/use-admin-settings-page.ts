"use client";

import { useEffect, useState } from "react";
import {
    fetchJson,
    type AdminStoreConfig,
} from "@/src/components/admin/admin-api";
import { useAdminToast } from "@/src/components/admin/admin-toast";
import {
    handlePageError,
    runWithSubmittingState,
} from "@/src/components/admin/pages/shared/admin-page-helpers";

export type StoreConfigFormData = {
    whatsappNumber: string;
    email: string;
    address: string;
    companyName: string;
    cnpj: string;
};

const initialForm: StoreConfigFormData = {
    whatsappNumber: "",
    email: "",
    address: "",
    companyName: "",
    cnpj: "",
};

export function useAdminSettingsPage() {
    const [form, setForm] = useState<StoreConfigFormData>(initialForm);
    const [updatedAt, setUpdatedAt] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const { showToast } = useAdminToast();

    useEffect(() => {
        const loadData = async () => {
            const config = await fetchJson<AdminStoreConfig>(
                "/api/admin/store-config",
            );
            setForm({
                whatsappNumber: config.whatsappNumber,
                email: config.email,
                address: config.address,
                companyName: config.companyName,
                cnpj: config.cnpj,
            });
            setUpdatedAt(config.updatedAt);
        };

        loadData()
            .catch((error) => {
                handlePageError({
                    error,
                    showToast,
                    toastMessage: "Falha ao carregar configurações.",
                    fallbackMessage: "Falha ao carregar configurações.",
                    setErrorMessage,
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [showToast]);

    const onChangeField = (field: keyof StoreConfigFormData, value: string) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);
        await runWithSubmittingState(setIsSubmitting, async () => {
            try {
                const updated = await fetchJson<AdminStoreConfig>(
                    "/api/admin/store-config",
                    {
                        method: "PUT",
                        body: JSON.stringify(form),
                    },
                );

                setUpdatedAt(updated.updatedAt);
                setSuccessMessage("Configurações salvas com sucesso.");
                showToast("Configurações salvas com sucesso.", {
                    variant: "success",
                });
            } catch (error) {
                handlePageError({
                    error,
                    showToast,
                    toastMessage: "Falha ao salvar configurações.",
                    fallbackMessage: "Falha ao salvar configurações.",
                    setErrorMessage,
                });
            }
        });
    };

    return {
        form,
        updatedAt,
        isLoading,
        isSubmitting,
        errorMessage,
        successMessage,
        onChangeField,
        onSubmit,
    };
}
