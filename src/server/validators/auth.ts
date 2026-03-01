import { z } from "zod";

const cpfRegex = /^\d{11}$/;

export const registerInputSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Nome deve ter pelo menos 2 caracteres")
        .max(120, "Nome deve ter no máximo 120 caracteres"),
    email: z.email(),
    cpf: z.string().regex(cpfRegex, "CPF deve conter 11 dígitos numéricos"),
    password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
});

export const loginInputSchema = z.object({
    login: z.string().min(1),
    password: z.string().min(8),
});

export const authResponseSchema = z.object({
    token: z.string(),
    user: z.object({
        id: z.string(),
        name: z.string(),
        email: z.email(),
        cpf: z.string(),
    }),
});

export type RegisterInput = z.infer<typeof registerInputSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
