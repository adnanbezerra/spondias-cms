import type { Metadata } from "next";
import { CartProvider } from "@/src/components/public/cart-context";
import { PublicToastProvider } from "@/src/components/public/public-toast";
import { WhatsAppFloat } from "@/src/components/public/whatsapp-float";
import { getPublicStoreConfig } from "@/src/server/public/public-content";
import "./globals.css";

export const metadata: Metadata = {
    title: "Spondias | Plantas e Jardinagem",
    description:
        "Loja de plantas da Spondias com catálogo online e atendimento via WhatsApp.",
    icons: {
        icon: [{ url: "/logo.jpg", type: "image/jpeg" }],
        shortcut: ["/logo.jpg"],
        apple: [{ url: "/logo.jpg", type: "image/jpeg" }],
    },
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const config = await getPublicStoreConfig();

    return (
        <html lang="pt-BR">
            <body className="antialiased">
                <PublicToastProvider>
                    <CartProvider whatsappNumber={config.whatsappNumber}>
                        {children}
                        <WhatsAppFloat whatsappNumber={config.whatsappNumber} />
                    </CartProvider>
                </PublicToastProvider>
            </body>
        </html>
    );
}
