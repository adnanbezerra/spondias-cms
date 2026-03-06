"use client";

import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogOverlay,
} from "@/src/components/ui/dialog";
import { useCart } from "@/src/components/public/cart-context";
import type { PublicProductDetails } from "@/src/server/public/public-content";

const formatBRL = (valueInCents: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valueInCents / 100);

type ProductViewDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    details: PublicProductDetails;
};

type ProductViewContentProps = {
    details: PublicProductDetails;
    shareUrl: string;
};

export function ProductViewContent({ details, shareUrl }: ProductViewContentProps) {
    const { addToCart } = useCart();
    const relatedProducts = Array.from(
        new Map(
            details.relatedByCategory
                .flatMap((group) => group.products)
                .map((product) => [product.id, product]),
        ).values(),
    );

    return (
        <div className="flex flex-col gap-4 p-4 lg:flex-row">
            <div className="min-w-0 flex-1 space-y-3">
                <Image
                    src={details.product.image}
                    alt={details.product.name}
                    width={900}
                    height={560}
                    className="h-72 w-full rounded-2xl object-cover md:h-[460px]"
                />
                <h2 className="text-3xl font-semibold [font-family:var(--font-title)]">{details.product.name}</h2>
                <p className="text-xl font-semibold">{formatBRL(details.product.priceInCents)}</p>
                <p className="text-sm text-[#334D40]/75">Estoque: {details.product.stock}</p>
                <p className="whitespace-pre-line text-sm text-[#334D40]/90">{details.product.description || "Sem descrição."}</p>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(shareUrl)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#334D40]/20 text-[#334D40] transition hover:bg-[#334D40] hover:text-[#DBD7CB]"
                        aria-label="Copiar link para compartilhar"
                        title="Copiar link para compartilhar"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M8 7.5V6A3 3 0 0 1 11 3h2a3 3 0 0 1 3 3v1.5" />
                            <rect x="7" y="7.5" width="10" height="13.5" rx="2" />
                            <path d="M10 12h4" />
                            <path d="M10 16h4" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={() => addToCart(details.product)}
                        className="rounded-xl bg-[#334D40] px-4 py-2 text-sm font-semibold text-[#DBD7CB]"
                    >
                        Adicionar ao carrinho
                    </button>
                </div>
            </div>

            <aside className="w-full space-y-3 rounded-2xl border border-[#334D40]/15 bg-[#F8F7F3] p-3 lg:w-[320px] lg:shrink-0">
                <p className="text-sm font-semibold">Produtos da mesma categoria</p>
                {relatedProducts.length === 0 ? (
                    <p className="text-xs text-[#334D40]/70">Sem produtos relacionados.</p>
                ) : (
                    <div className="space-y-2">
                        {relatedProducts.map((product) => (
                            <a
                                key={product.id}
                                href={`/produto/${product.id}`}
                                className="flex items-center gap-2 rounded-xl border border-[#334D40]/10 bg-white p-2 text-xs"
                            >
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    width={64}
                                    height={64}
                                    className="h-14 w-14 rounded-lg object-cover"
                                />
                                <div className="min-w-0">
                                    <p className="truncate font-semibold">{product.name}</p>
                                    <p className="text-[#334D40]/70">{formatBRL(product.priceInCents)}</p>
                                    <p className="truncate text-[#334D40]/70">
                                        {product.categoryNames.join(" • ")}
                                    </p>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </aside>
        </div>
    );
}

export function ProductViewDialog({ open, onOpenChange, details }: ProductViewDialogProps) {
    const shareUrl = typeof window === "undefined"
        ? `/produto/${details.product.id}`
        : `${window.location.origin}/produto/${details.product.id}`;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogOverlay />
            <DialogContent className="max-h-[90vh] max-w-6xl overflow-auto p-0">
                <ProductViewContent details={details} shareUrl={shareUrl} />
            </DialogContent>
        </Dialog>
    );
}
