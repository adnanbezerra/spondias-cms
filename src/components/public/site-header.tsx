import Image from "next/image";
import Link from "next/link";
import type { PublicCategory } from "@/src/server/public/public-content";

type SiteHeaderProps = {
  categories: PublicCategory[];
};

export const SiteHeader = ({ categories }: SiteHeaderProps) => {
  return (
    <header className="sticky top-0 z-30 border-b border-[#334D40]/15 bg-[#DBD7CB]/95 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.jpg"
            alt="Spondias"
            width={42}
            height={42}
            className="rounded-full border border-[#334D40]/20 object-cover"
            priority
          />
          <span className="text-xl font-semibold tracking-wide [font-family:var(--font-title)]">
            Spondias
          </span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <Link
            href="/"
            className="rounded-full border border-[#334D40]/20 px-4 py-2 text-sm font-medium transition hover:bg-[#334D40] hover:text-[#DBD7CB]"
          >
            Início
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categoria/${category.id}`}
              className="rounded-full border border-[#334D40]/20 px-4 py-2 text-sm font-medium transition hover:bg-[#334D40] hover:text-[#DBD7CB]"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mx-auto flex w-full max-w-6xl gap-2 overflow-x-auto px-4 pb-3 md:hidden sm:px-6">
        <Link
          href="/"
          className="whitespace-nowrap rounded-full border border-[#334D40]/20 px-4 py-1.5 text-sm font-medium"
        >
          Início
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categoria/${category.id}`}
            className="whitespace-nowrap rounded-full border border-[#334D40]/20 px-4 py-1.5 text-sm font-medium"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </header>
  );
};
