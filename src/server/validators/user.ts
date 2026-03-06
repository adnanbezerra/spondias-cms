import { z } from "zod";

const cpfRegex = /^\d{11}$/;

export const userIdParamsSchema = z.object({
    id: z.uuid(),
});

export const userOutputSchema = z.object({
    id: z.uuid(),
    name: z.string(),
    email: z.email(),
    cpf: z.string().regex(cpfRegex),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const userCreateInputSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Nome deve ter pelo menos 2 caracteres")
        .max(120, "Nome deve ter no máximo 120 caracteres"),
    email: z.email(),
    cpf: z.string().regex(cpfRegex, "CPF deve conter 11 dígitos numéricos"),
    password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
    isActive: z.boolean().optional().default(true),
});

export const userUpdateInputSchema = z.object({
    isActive: z.boolean(),
});

export type UserOutput = z.infer<typeof userOutputSchema>;
export type UserCreateInput = z.infer<typeof userCreateInputSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateInputSchema>;
