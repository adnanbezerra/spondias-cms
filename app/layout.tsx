import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spondias CMS",
  description:
    "CMS para gestão de loja de plantas com área pública e administrativa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
