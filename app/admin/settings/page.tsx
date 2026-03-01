"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/src/components/admin/admin-nav";
import { useAdminToast } from "@/src/components/admin/admin-toast";
import { fetchJson, type AdminStoreConfig } from "@/src/components/admin/admin-api";

type StoreConfigForm = {
  whatsappNumber: string;
  email: string;
  address: string;
  companyName: string;
  cnpj: string;
};

const initialForm: StoreConfigForm = {
  whatsappNumber: "",
  email: "",
  address: "",
  companyName: "",
  cnpj: "",
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState<StoreConfigForm>(initialForm);
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { showToast } = useAdminToast();

  const loadData = async () => {
    const config = await fetchJson<AdminStoreConfig>("/api/admin/store-config");
    setForm({
      whatsappNumber: config.whatsappNumber,
      email: config.email,
      address: config.address,
      companyName: config.companyName,
      cnpj: config.cnpj,
    });
    setUpdatedAt(config.updatedAt);
  };

  useEffect(() => {
    loadData().catch(() => {
      setErrorMessage("Falha ao carregar configurações.");
      showToast("Falha ao carregar configurações.", { variant: "error" });
    });
  }, [showToast]);

  const onChangeField = (field: keyof StoreConfigForm, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const updated = await fetchJson<AdminStoreConfig>("/api/admin/store-config", {
        method: "PUT",
        body: JSON.stringify(form),
      });

      setUpdatedAt(updated.updatedAt);
      setSuccessMessage("Configurações salvas com sucesso.");
      showToast("Configurações salvas com sucesso.", { variant: "success" });
    } catch (error) {
      showToast("Falha ao salvar configurações.", { variant: "error" });
      setErrorMessage(error instanceof Error ? error.message : "Falha ao salvar configurações.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <AdminNav />
      <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-[#334D40]/15 bg-white/80 p-5 shadow-sm"
        >
          <h1 className="text-2xl font-semibold [font-family:var(--font-title)]">
            Configurações da loja
          </h1>
          <p className="text-sm text-[#334D40]/80">
            Dados exibidos no site público e usados no contato comercial.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">WhatsApp</label>
              <input
                value={form.whatsappNumber}
                onChange={(event) => onChangeField("whatsappNumber", event.target.value)}
                className="w-full rounded-xl border border-[#334D40]/20 bg-white px-3 py-2"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(event) => onChangeField("email", event.target.value)}
                className="w-full rounded-xl border border-[#334D40]/20 bg-white px-3 py-2"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Endereço</label>
            <input
              value={form.address}
              onChange={(event) => onChangeField("address", event.target.value)}
              className="w-full rounded-xl border border-[#334D40]/20 bg-white px-3 py-2"
              required
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Nome da empresa</label>
              <input
                value={form.companyName}
                onChange={(event) => onChangeField("companyName", event.target.value)}
                className="w-full rounded-xl border border-[#334D40]/20 bg-white px-3 py-2"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">CNPJ</label>
              <input
                value={form.cnpj}
                onChange={(event) => onChangeField("cnpj", event.target.value)}
                className="w-full rounded-xl border border-[#334D40]/20 bg-white px-3 py-2"
                required
              />
            </div>
          </div>

          {updatedAt ? (
            <p className="text-xs text-[#334D40]/70">
              Última atualização: {new Date(updatedAt).toLocaleString("pt-BR")}
            </p>
          ) : null}

          {errorMessage ? (
            <p className="rounded-xl bg-red-100 px-3 py-2 text-sm text-red-800">
              {errorMessage}
            </p>
          ) : null}
          {successMessage ? (
            <p className="rounded-xl bg-emerald-100 px-3 py-2 text-sm text-emerald-800">
              {successMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-[#334D40] px-4 py-2 font-semibold text-[#DBD7CB] disabled:opacity-70"
          >
            {isSubmitting ? "Salvando..." : "Salvar configurações"}
          </button>
        </form>
      </section>
    </main>
  );
}
