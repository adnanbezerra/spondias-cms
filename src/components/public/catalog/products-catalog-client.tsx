"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/src/components/public/product-card";
import { ProductViewDialog } from "@/src/components/public/product-view-dialog";
import { useCart } from "@/src/components/public/cart-context";
import type {
    PublicProduct,
    PublicProductDetails,
} from "@/src/server/public/public-content";

type ProductsCatalogClientProps = {
    products: PublicProduct[];
};

const getInitialProductIdFromQuery = (): string | null => {
    if (typeof window === "undefined") {
        return null;
    }

    const query = new URLSearchParams(window.location.search);
    return query.get("produto");
};

export function ProductsCatalogClient({ products }: ProductsCatalogClientProps) {
    const [selectedProduct, setSelectedProduct] = useState<PublicProductDetails | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const initialProductId = getInitialProductIdFromQuery();
    const { addToCart } = useCart();

    const openProduct = async (productId: string) => {
        const response = await fetch(`/api/public/products/${productId}`);
        if (!response.ok) return;

        const payload = (await response.json()) as PublicProductDetails;
        setSelectedProduct(payload);
        setIsDialogOpen(true);
        window.history.replaceState(null, "", `?produto=${productId}`);
    };

    useEffect(() => {
        if (!initialProductId) {
            return;
        }

        fetch(`/api/public/products/${initialProductId}`)
            .then((response) => {
                if (!response.ok) {
                    return null;
                }

                return response.json() as Promise<PublicProductDetails>;
            })
            .then((payload) => {
                if (!payload) {
                    return;
                }

                setSelectedProduct(payload);
                setIsDialogOpen(true);
            })
            .catch(() => undefined);
    }, [initialProductId]);

    return (
        <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onOpenProduct={openProduct}
                        onAddToCart={addToCart}
                    />
                ))}
            </div>

            {selectedProduct ? (
                <ProductViewDialog
                    open={isDialogOpen}
                    onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) {
                            const basePath = window.location.pathname;
                            window.history.replaceState(null, "", basePath);
                        }
                    }}
                    details={selectedProduct}
                />
            ) : null}
        </>
    );
}
