import Image from "next/image";
import { buildWhatsAppUrl, formatBRL, type PublicProduct } from "@/src/server/public/public-content";

type ProductCardProps = {
  product: PublicProduct;
  whatsappNumber: string;
};

const calculateFinalPrice = (priceInCents: number, discountPercentage: number): number => {
  if (discountPercentage <= 0) return priceInCents;
  return Math.max(0, Math.round(priceInCents * (1 - discountPercentage / 100)));
};

export const ProductCard = ({ product, whatsappNumber }: ProductCardProps) => {
  const finalPrice = calculateFinalPrice(product.priceInCents, product.discountPercentage);
  const whatsappHref = buildWhatsAppUrl(
    whatsappNumber,
    `Olá, quero comprar o produto: ${product.name}`,
  );

  return (
    <article className="rounded-2xl border border-[#334D40]/15 bg-white p-4 shadow-sm">
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
        <p className="text-sm text-[#334D40]/80">{product.description}</p>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          {product.discountPercentage > 0 ? (
            <p className="text-xs text-[#334D40]/70 line-through">
              {formatBRL(product.priceInCents)}
            </p>
          ) : null}
          <p className="text-lg font-semibold">{formatBRL(finalPrice)}</p>
          <p className="text-xs text-[#334D40]/70">Estoque: {product.stock}</p>
        </div>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-[#334D40] px-4 py-2 text-sm font-semibold text-[#DBD7CB] transition hover:opacity-90"
        >
          Comprar agora
        </a>
      </div>
    </article>
  );
};
