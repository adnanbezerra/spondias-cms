import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen text-[#334D40]">{children}</div>;
}
