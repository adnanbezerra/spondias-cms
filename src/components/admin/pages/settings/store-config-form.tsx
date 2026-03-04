"use client";

type StoreConfigFormData = {
    whatsappNumber: string;
    email: string;
    address: string;
    companyName: string;
    cnpj: string;
};

type StoreConfigFormProps = {
    form: StoreConfigFormData;
    onChangeField: (field: keyof StoreConfigFormData, value: string) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
    updatedAt: string;
    errorMessage: string | null;
    successMessage: string | null;
    isSubmitting: boolean;
};

export function StoreConfigForm({
    form,
    onChangeField,
    onSubmit,
    updatedAt,
    errorMessage,
    successMessage,
    isSubmitting,
}: StoreConfigFormProps) {
    return (
        <form
            onSubmit={onSubmit}
            className="space-y-4 rounded-2xl border border-[#334D40]/15 bg-white p-5 shadow-sm"
        >
            <h2 className="text-2xl font-semibold [font-family:var(--font-title)]">
                Configurações da loja
            </h2>
            <p className="text-sm text-[#334D40]/80">
                Dados exibidos no site público e usados no contato comercial.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                    <label className="text-sm font-medium">WhatsApp</label>
                    <input
                        value={form.whatsappNumber}
                        onChange={(event) =>
                            onChangeField("whatsappNumber", event.target.value)
                        }
                        className="w-full rounded-xl border border-[#334D40]/20 bg-white px-3 py-2"
                        required
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium">Email</label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={(event) =>
                            onChangeField("email", event.target.value)
                        }
                        className="w-full rounded-xl border border-[#334D40]/20 bg-white px-3 py-2"
                        required
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium">Endereço</label>
                <input
                    value={form.address}
                    onChange={(event) =>
                        onChangeField("address", event.target.value)
                    }
                    className="w-full rounded-xl border border-[#334D40]/20 bg-white px-3 py-2"
                    required
                />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                    <label className="text-sm font-medium">
                        Nome da empresa
                    </label>
                    <input
                        value={form.companyName}
                        onChange={(event) =>
                            onChangeField("companyName", event.target.value)
                        }
                        className="w-full rounded-xl border border-[#334D40]/20 bg-white px-3 py-2"
                        required
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium">CNPJ</label>
                    <input
                        value={form.cnpj}
                        onChange={(event) =>
                            onChangeField("cnpj", event.target.value)
                        }
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
    );
}
