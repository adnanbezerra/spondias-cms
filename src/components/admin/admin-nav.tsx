import Link from "next/link";
import { LogoutButton } from "@/src/components/admin/logout-button";

export const AdminNav = () => {
  return (
    <header className="border-b border-[#334D40]/15 bg-white/80">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/admin"
            className="rounded-full border border-[#334D40]/20 px-3 py-1.5"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/sections"
            className="rounded-full border border-[#334D40]/20 px-3 py-1.5"
          >
            Seções
          </Link>
          <Link
            href="/admin/products"
            className="rounded-full border border-[#334D40]/20 px-3 py-1.5"
          >
            Produtos
          </Link>
        </div>

        <LogoutButton />
      </div>
    </header>
  );
};
