"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/src/components/admin/logout-button";

const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/categories", label: "Categorias" },
    { href: "/admin/products", label: "Produtos" },
    { href: "/admin/sections", label: "Seções" },
    { href: "/admin/users", label: "Usuários" },
    { href: "/admin/settings", label: "Configurações" },
];

const isCurrent = (pathname: string, href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
};

export const AdminSidebar = () => {
    const pathname = usePathname();

    return (
        <>
            <header className="border-b border-[#334D40]/15 bg-white/90 px-4 py-3 lg:hidden">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#334D40]/70">
                            Spondias Jardinagem
                        </p>
                        <p className="text-sm font-semibold text-[#334D40]">
                            Área do Administrador
                        </p>
                    </div>
                    <Link
                        href="/"
                        className="rounded-full border border-[#334D40]/20 px-3 py-1.5 text-xs font-medium"
                    >
                        Voltar para a Loja
                    </Link>
                </div>
                <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {links.map((link) => {
                        const active = isCurrent(pathname, link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={
                                    active
                                        ? "rounded-full bg-[#334D40] px-3 py-1.5 text-xs font-semibold text-[#DBD7CB]"
                                        : "rounded-full border border-[#334D40]/20 px-3 py-1.5 text-xs"
                                }
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>
            </header>

            <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-[#334D40]/15 bg-[#F8F7F3] lg:flex lg:flex-col">
                <div className="border-b border-[#334D40]/10 px-6 py-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#334D40]/70">
                        Spondias Jardinagem
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold [font-family:var(--font-title)]">
                        Administrador
                    </h1>
                </div>

                <nav className="flex-1 space-y-1 px-4 py-5">
                    {links.map((link) => {
                        const active = isCurrent(pathname, link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={
                                    active
                                        ? "block rounded-xl bg-[#334D40] px-4 py-2.5 text-sm font-semibold text-[#DBD7CB]"
                                        : "block rounded-xl px-4 py-2.5 text-sm font-medium text-[#334D40]/85 hover:bg-[#DBD7CB]/45"
                                }
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="space-y-3 border-t border-[#334D40]/10 p-4">
                    <Link
                        href="/"
                        className="block w-full rounded-xl bg-[#334D40] px-4 py-2.5 text-center text-sm font-semibold text-[#DBD7CB]"
                    >
                        Voltar para a Loja
                    </Link>
                    <LogoutButton />
                </div>
            </aside>
        </>
    );
};
