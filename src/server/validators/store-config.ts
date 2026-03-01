import { z } from "zod";

export const storeConfigUpdateInputSchema = z.object({
    whatsappNumber: z.string().min(10),
    email: z.email(),
    address: z.string().min(5),
    companyName: z.string().min(2),
    cnpj: z.string().min(14),
});

export const storeConfigOutputSchema = z.object({
    id: z.uuid(),
    whatsappNumber: z.string(),
    email: z.string(),
    address: z.string(),
    companyName: z.string(),
    cnpj: z.string(),
    updatedAt: z.date(),
});

export type StoreConfigUpdateInput = z.infer<typeof storeConfigUpdateInputSchema>;
