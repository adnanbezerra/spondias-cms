"use client";

import Image from "next/image";
import type { PublicProduct } from "@/src/server/public/public-content";

type ProductCardProps = {
    product: PublicProduct;
    className?: string;
    onOpenProduct: (productId: string) => void;
    onAddToCart: (product: PublicProduct) => void;
};

const formatBRL = (valueInCents: number) =>
    new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(valueInCents / 100);

export const ProductCard = ({
    product,
    className = "",
    onOpenProduct,
    onAddToCart,
}: ProductCardProps) => {
    const hasDiscount = product.discountPercentage > 0;
    const price70 = hasDiscount
        ? Math.round(product.price70gInCents * (1 - product.discountPercentage / 100))
        : product.price70gInCents;
    const price100 = hasDiscount
        ? Math.round(product.price100gInCents * (1 - product.discountPercentage / 100))
        : product.price100gInCents;

    return (
        <article
            className={`group rounded-2xl border border-[#334D40]/15 bg-white p-4 shadow-sm ${className}`}
        >
            <button
                type="button"
                onClick={() => onOpenProduct(product.id)}
                className="w-full text-left"
            >
                <Image
                    src={product.image}
                    alt={product.name}
                    width={320}
                    height={180}
                    className="h-44 w-full rounded-xl object-cover"
                />

                <div className="mt-4 space-y-2">
                    <h3 className="text-lg font-semibold [font-family:var(--font-title)]">
                        {product.name}
                    </h3>
                </div>
            </button>

            <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                    {hasDiscount ? (
                        <p className="text-xs text-[#334D40]/70 line-through">
                            70g {formatBRL(product.price70gInCents)} · 100g {formatBRL(product.price100gInCents)}
                        </p>
                    ) : null}
                    <p className="text-sm font-semibold">
                        70g: {formatBRL(price70)}
                    </p>
                    <p className="text-sm font-semibold">
                        100g: {formatBRL(price100)}
                    </p>
                    <p className="text-xs text-[#334D40]/70">
                        Estoque: {product.stock}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => onAddToCart(product)}
                    className="rounded-full bg-[#334D40] px-4 py-2 text-sm font-semibold text-[#DBD7CB] opacity-0 transition group-hover:opacity-100"
                >
                    Adicionar ao carrinho
                </button>
            </div>
        </article>
    );
};
