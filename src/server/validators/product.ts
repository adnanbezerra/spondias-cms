import { z } from "zod";

const imageReferenceSchema = z.string().refine(
    (value) => value.startsWith("/") || URL.canParse(value),
    "URL da imagem inválida.",
);

export const productCreateInputSchema = z.object({
    name: z.string().min(2),
    description: z.string().max(10000).optional().default(""),
    stock: z.number().int().nonnegative(),
    discountPercentage: z.number().int().min(0).max(100).optional().default(0),
    image: imageReferenceSchema.nullable().optional(),
    isActive: z.boolean().optional().default(true),
    categoryIds: z.array(z.uuid()).length(1),
});

export const productUpdateInputSchema = z.object({
    name: z.string().min(2).optional(),
    description: z.string().max(10000).optional(),
    stock: z.number().int().nonnegative().optional(),
    discountPercentage: z.number().int().min(0).max(100).optional(),
    image: imageReferenceSchema.nullable().optional(),
    isActive: z.boolean().optional(),
    categoryIds: z.array(z.uuid()).length(1).optional(),
});

export const productIdParamsSchema = z.object({
    id: z.uuid(),
});

export const productOutputSchema = z.object({
    id: z.uuid(),
    name: z.string(),
    description: z.string(),
    stock: z.number().int().nonnegative(),
    discountPercentage: z.number().int().min(0).max(100),
    image: z.string().nullable(),
    isActive: z.boolean(),
    categoryIds: z.array(z.uuid()).length(1),
    lineName: z.string().nullable(),
    pricePerGram: z.number().int().nonnegative(),
    price70g: z.number().int().nonnegative(),
    price100g: z.number().int().nonnegative(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type ProductCreateInput = z.infer<typeof productCreateInputSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateInputSchema>;
