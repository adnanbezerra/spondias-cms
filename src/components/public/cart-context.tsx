"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { usePublicToast } from "@/src/components/public/public-toast";
import type { PublicProduct } from "@/src/server/public/public-content";

type CartItem = {
    product: PublicProduct;
    quantity: number;
};

type CartContextValue = {
    items: CartItem[];
    totalItems: number;
    addToCart: (product: PublicProduct) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    whatsappCheckoutUrl: string;
};

const CART_STORAGE_KEY = "spondias-cart";

const buildWhatsAppUrl = (phone: string, message: string): string => {
    const phoneDigits = phone.replace(/\D/g, "");
    return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
};

const CartContext = createContext<CartContextValue | null>(null);

type CartProviderProps = {
    children: ReactNode;
    whatsappNumber: string;
};

const getInitialItems = (): CartItem[] => {
    if (typeof window === "undefined") {
        return [];
    }

    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
        return [];
    }

    try {
        return JSON.parse(raw) as CartItem[];
    } catch {
        return [];
    }
};

export function CartProvider({ children, whatsappNumber }: CartProviderProps) {
    const [items, setItems] = useState<CartItem[]>(getInitialItems);
    const { showToast } = usePublicToast();

    useEffect(() => {
        if (items.length === 0) {
            window.localStorage.removeItem(CART_STORAGE_KEY);
            return;
        }

        window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const addToCart = useCallback((product: PublicProduct) => {
        setItems((current) => {
            const existing = current.find((item) => item.product.id === product.id);
            if (!existing) {
                return [...current, { product, quantity: 1 }];
            }

            return current.map((item) =>
                item.product.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item,
            );
        });
        showToast("Produto adicionado ao carrinho.", { variant: "success" });
    }, [showToast]);

    const removeFromCart = useCallback((productId: string) => {
        setItems((current) => current.filter((item) => item.product.id !== productId));
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const totalItems = useMemo(
        () => items.reduce((acc, item) => acc + item.quantity, 0),
        [items],
    );

    const whatsappCheckoutUrl = useMemo(() => {
        const lines = [
            "Olá! Vim pelo website da Spondias, e fiz um carrinho lá. Seguem os itens:",
            ...items.map((item) => `- ${item.product.name}${item.quantity > 1 ? ` (x${item.quantity})` : ""}`),
        ];

        return buildWhatsAppUrl(whatsappNumber, lines.join("\n"));
    }, [items, whatsappNumber]);

    return (
        <CartContext.Provider
            value={{
                items,
                totalItems,
                addToCart,
                removeFromCart,
                clearCart,
                whatsappCheckoutUrl,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart precisa estar dentro de CartProvider.");
    }

    return context;
};
