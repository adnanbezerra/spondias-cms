"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { PublicCategory } from "@/src/server/public/public-content";
import { useCart } from "@/src/components/public/cart-context";

type SiteHeaderProps = {
    categories: PublicCategory[];
};

const formatBRL = (valueInCents: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valueInCents / 100);

export const SiteHeader = ({ categories }: SiteHeaderProps) => {
    const [cartOpen, setCartOpen] = useState(false);
    const { items, totalItems, removeFromCart, whatsappCheckoutUrl } = useCart();

    return (
        <header className="sticky top-0 z-30 border-b border-[#334D40]/15 bg-[#DBD7CB]/95 backdrop-blur-md">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
                <Link href="/" className="flex items-center gap-3">
                    <Image
                        src="/logo.jpg"
                        alt="Spondias"
                        width={42}
                        height={42}
                        className="rounded-full border border-[#334D40]/20 object-cover"
                        priority
                    />
                    <span className="text-xl font-semibold tracking-wide [font-family:var(--font-title)]">
                        Spondias
                    </span>
                </Link>

                <div className="flex items-center gap-2">
                    <nav className="hidden items-center gap-2 md:flex">
                        <Link
                            href="/"
                            className="rounded-full border border-[#334D40]/20 px-4 py-2 text-sm font-medium transition hover:bg-[#334D40] hover:text-[#DBD7CB]"
                        >
                            Início
                        </Link>
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/categoria/${category.id}`}
                                className="rounded-full border border-[#334D40]/20 px-4 py-2 text-sm font-medium transition hover:bg-[#334D40] hover:text-[#DBD7CB]"
                            >
                                {category.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setCartOpen((open) => !open)}
                            className="relative rounded-full border border-[#334D40]/20 bg-white/60 p-2"
                            aria-label="Abrir carrinho"
                        >
                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <circle cx="9" cy="20" r="1.3" />
                                <circle cx="18" cy="20" r="1.3" />
                                <path d="M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.8L20 7H7" />
                            </svg>
                            {totalItems > 0 ? (
                                <span className="absolute -top-2 -right-2 rounded-full bg-[#334D40] px-1.5 text-xs text-white">
                                    {totalItems}
                                </span>
                            ) : null}
                        </button>

                        {cartOpen ? (
                            <div className="absolute right-0 z-40 mt-2 w-80 rounded-2xl border border-[#334D40]/15 bg-white p-3 shadow-lg">
                                <p className="text-sm font-semibold">Carrinho</p>
                                {items.length === 0 ? (
                                    <p className="mt-3 text-xs text-[#334D40]/70">Seu carrinho está vazio.</p>
                                ) : (
                                    <>
                                        <div className="mt-3 max-h-64 space-y-2 overflow-auto">
                                            {items.map((item) => (
                                                <div key={item.product.id} className="rounded-xl border border-[#334D40]/15 p-2 text-xs">
                                                    <p className="font-semibold">{item.product.name} {item.quantity > 1 ? `x${item.quantity}` : ""}</p>
                                                    <p>{formatBRL(item.product.priceInCents)}</p>
                                                    <button
                                                        type="button"
                                                        className="mt-1 text-red-700"
                                                        onClick={() => removeFromCart(item.product.id)}
                                                    >
                                                        Remover
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <a
                                            href={whatsappCheckoutUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-3 block rounded-xl bg-[#334D40] px-3 py-2 text-center text-sm font-semibold text-[#DBD7CB]"
                                        >
                                            Fechar compra no WhatsApp
                                        </a>
                                    </>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="mx-auto flex w-full max-w-6xl gap-2 overflow-x-auto px-4 pb-3 md:hidden sm:px-6">
                <Link
                    href="/"
                    className="whitespace-nowrap rounded-full border border-[#334D40]/20 px-4 py-1.5 text-sm font-medium"
                >
                    Início
                </Link>
                {categories.map((category) => (
                    <Link
                        key={category.id}
                        href={`/categoria/${category.id}`}
                        className="whitespace-nowrap rounded-full border border-[#334D40]/20 px-4 py-1.5 text-sm font-medium"
                    >
                        {category.name}
                    </Link>
                ))}
            </div>
        </header>
    );
};
