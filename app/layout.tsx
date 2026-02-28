import type { Metadata } from "next";
import { Cormorant_Garamond, Work_Sans } from "next/font/google";
import { WhatsAppFloat } from "@/src/components/public/whatsapp-float";
import { getPublicStoreConfig } from "@/src/server/public/public-content";
import "./globals.css";

const bodyFont = Work_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const titleFont = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-title",
  weight: ["500", "700"],
});

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
      <body className={`${bodyFont.variable} ${titleFont.variable} antialiased`}>
        {children}
        <WhatsAppFloat whatsappNumber={config.whatsappNumber} />
      </body>
    </html>
  );
}
