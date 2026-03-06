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

    return (
        <div className="grid gap-4 p-4 md:grid-cols-[1fr,320px]">
            <div className="space-y-3">
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
                        className="rounded-xl border border-[#334D40]/20 px-4 py-2 text-sm"
                    >
                        Copiar link para compartilhar
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

            <aside className="space-y-3 rounded-2xl border border-[#334D40]/15 bg-[#F8F7F3] p-3">
                <p className="text-sm font-semibold">Produtos da mesma categoria</p>
                {details.relatedByCategory.length === 0 ? (
                    <p className="text-xs text-[#334D40]/70">Sem produtos relacionados.</p>
                ) : (
                    details.relatedByCategory.map((group) => (
                        <div key={group.categoryId} className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#334D40]/80">{group.categoryName}</p>
                            <div className="space-y-2">
                                {group.products.map((product) => (
                                    <a key={product.id} href={`/produto/${product.id}`} className="block rounded-xl border border-[#334D40]/10 bg-white p-2 text-xs">
                                        {product.name}
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))
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
