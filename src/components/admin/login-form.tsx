"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AuthResponse = {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        cpf: string;
    };
};

export const LoginForm = () => {
    const router = useRouter();
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage(null);
        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({ login, password }),
            });

            const payload = (await response.json()) as
        | AuthResponse
        | { message?: string };

            if (!response.ok) {
                const errorPayload = payload as { message?: string };
                setErrorMessage(errorPayload.message ?? "Falha no login.");
                return;
            }

            router.push("/admin");
            router.refresh();
        } catch {
            setErrorMessage("Falha de conexão ao autenticar.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="login">
                    Email ou CPF
                </label>
                <input
                    id="login"
                    className="w-full rounded-xl border border-[#334D40]/20 bg-white px-3 py-2"
                    value={login}
                    onChange={(event) => setLogin(event.target.value)}
                    placeholder="contato@spondias.com.br"
                    required
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="password">
                    Senha
                </label>
                <input
                    id="password"
                    type="password"
                    className="w-full rounded-xl border border-[#334D40]/20 bg-white px-3 py-2"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="********"
                    required
                    minLength={8}
                />
            </div>

            {errorMessage ? (
                <p className="rounded-xl bg-red-100 px-3 py-2 text-sm text-red-800">
                    {errorMessage}
                </p>
            ) : null}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-[#334D40] px-4 py-2 font-semibold text-[#DBD7CB] disabled:opacity-70"
            >
                {isLoading ? "Entrando..." : "Entrar"}
            </button>
        </form>
    );
};
