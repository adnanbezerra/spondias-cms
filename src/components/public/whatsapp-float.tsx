"use client";

import { usePathname } from "next/navigation";

type WhatsAppFloatProps = {
    whatsappNumber: string;
};

const buildWhatsAppUrl = (phone: string, message: string): string => {
    const phoneDigits = phone.replace(/\D/g, "");
    return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
};

export const WhatsAppFloat = ({ whatsappNumber }: WhatsAppFloatProps) => {
    const pathname = usePathname();

    if (pathname.startsWith("/admin")) {
        return null;
    }

    const href = buildWhatsAppUrl(
        whatsappNumber,
        "Olá, vim pelo site e quero atendimento.",
    );

    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-[1.03] hover:shadow-xl"
            aria-label="Conversar no WhatsApp"
        >
            <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-7 w-7 fill-current"
            >
                <path d="M19.05 4.91A9.82 9.82 0 0 0 12.03 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.74.45 3.44 1.31 4.95L2 22l5.38-1.41a9.85 9.85 0 0 0 4.65 1.19h.01c5.46 0 9.9-4.44 9.9-9.9a9.8 9.8 0 0 0-2.89-6.97m-7.02 15.2h-.01a8.13 8.13 0 0 1-4.14-1.13l-.3-.18-3.19.84.85-3.11-.2-.32a8.16 8.16 0 0 1-1.25-4.32c0-4.5 3.66-8.16 8.16-8.16 2.18 0 4.23.85 5.77 2.39a8.1 8.1 0 0 1 2.39 5.77c0 4.5-3.66 8.16-8.16 8.16m4.47-6.1c-.24-.12-1.43-.71-1.65-.79-.22-.08-.38-.12-.54.12-.16.24-.62.79-.76.95-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.22-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.79-.2-.47-.4-.4-.54-.4h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.36.51.57.18 1.08.15 1.49.09.45-.07 1.43-.58 1.63-1.14.2-.56.2-1.05.14-1.15-.06-.1-.22-.16-.46-.28" />
            </svg>
        </a>
    );
};
