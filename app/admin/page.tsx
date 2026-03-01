import Link from "next/link";
import { AdminNav } from "@/src/components/admin/admin-nav";

export default function AdminDashboardPage() {
    return (
        <main>
            <AdminNav />
            <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
                <h1 className="text-3xl font-semibold [font-family:var(--font-title)]">
                    Painel administrativo
                </h1>
                <p className="mt-2 text-sm text-[#334D40]/80">
                    Escolha uma área para gerenciar o catálogo da loja.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <Link
                        href="/admin/categories"
                        className="rounded-2xl border border-[#334D40]/15 bg-white/80 p-5 shadow-sm"
                    >
                        <h2 className="text-xl font-semibold">Categorias</h2>
                        <p className="mt-1 text-sm text-[#334D40]/80">
                            Criar, editar e inativar categorias de navegação.
                        </p>
                    </Link>
                    <Link
                        href="/admin/sections"
                        className="rounded-2xl border border-[#334D40]/15 bg-white/80 p-5 shadow-sm"
                    >
                        <h2 className="text-xl font-semibold">Seções</h2>
                        <p className="mt-1 text-sm text-[#334D40]/80">
                            Criar seções e definir banner com upload de imagem.
                        </p>
                    </Link>
                    <Link
                        href="/admin/products"
                        className="rounded-2xl border border-[#334D40]/15 bg-white/80 p-5 shadow-sm"
                    >
                        <h2 className="text-xl font-semibold">Produtos</h2>
                        <p className="mt-1 text-sm text-[#334D40]/80">
                            Cadastrar produtos com imagem e vincular em seções.
                        </p>
                    </Link>
                    <Link
                        href="/admin/settings"
                        className="rounded-2xl border border-[#334D40]/15 bg-white/80 p-5 shadow-sm"
                    >
                        <h2 className="text-xl font-semibold">Configurações</h2>
                        <p className="mt-1 text-sm text-[#334D40]/80">
                            Atualizar WhatsApp, email, endereço, empresa e CNPJ.
                        </p>
                    </Link>
                </div>
            </section>
        </main>
    );
}
