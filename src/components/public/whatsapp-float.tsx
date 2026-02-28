import { buildWhatsAppUrl } from "@/src/server/public/public-content";

type WhatsAppFloatProps = {
  whatsappNumber: string;
};

export const WhatsAppFloat = ({ whatsappNumber }: WhatsAppFloatProps) => {
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
      <span className="text-sm font-bold">WA</span>
    </a>
  );
};
