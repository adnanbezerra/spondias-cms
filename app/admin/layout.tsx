import type { ReactNode } from "react";
import { AdminToastProvider } from "@/src/components/admin/admin-toast";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminToastProvider>
      <div className="min-h-screen text-[#334D40]">{children}</div>
    </AdminToastProvider>
  );
}
