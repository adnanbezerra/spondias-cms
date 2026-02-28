import type { Metadata } from "next";
import { WhatsAppFloat } from "@/src/components/public/whatsapp-float";
import { getPublicStoreConfig } from "@/src/server/public/public-content";
import "./globals.css";

export const metadata: Metadata = {
    title: "Spondias | Plantas e Jardinagem",
    description:
        "Loja de plantas da Spondias com catálogo online e atendimento via WhatsApp.",
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
                {children}
                <WhatsAppFloat whatsappNumber={config.whatsappNumber} />
            </body>
        </html>
    );
}
