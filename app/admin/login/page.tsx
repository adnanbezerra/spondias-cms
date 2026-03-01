import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "@/src/components/admin/login-form";
import { verifyJwt } from "@/src/server/security/jwt";

export default async function AdminLoginPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("spondias_token")?.value;

    if (token) {
        try {
            verifyJwt(token);
            redirect("/admin");
        } catch {
            // Keep on login when token is invalid.
        }
    }

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 sm:px-6">
            <section className="w-full rounded-2xl border border-[#334D40]/15 bg-white/80 p-6 shadow-sm">
                <h1 className="text-2xl font-semibold [font-family:var(--font-title)]">
                    Área administrativa
                </h1>
                <p className="mt-2 text-sm text-[#334D40]/80">
                    Faça login para gerenciar produtos, seções e imagens.
                </p>
                <div className="mt-5">
                    <LoginForm />
                </div>
            </section>
        </main>
    );
}
