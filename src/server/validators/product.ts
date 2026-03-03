import { z } from "zod";

const imageReferenceSchema = z.string().refine(
    (value) => value.startsWith("/") || URL.canParse(value),
    "URL da imagem inválida.",
);

export const productCreateInputSchema = z.object({
    name: z.string().min(2),
    price: z.number().int().nonnegative(),
    stock: z.number().int().nonnegative(),
    discountPercentage: z.number().int().min(0).max(100).optional().default(0),
    image: imageReferenceSchema.nullable().optional(),
    isActive: z.boolean().optional().default(true),
});

export const productUpdateInputSchema = z.object({
    name: z.string().min(2).optional(),
    price: z.number().int().nonnegative().optional(),
    stock: z.number().int().nonnegative().optional(),
    discountPercentage: z.number().int().min(0).max(100).optional(),
    image: imageReferenceSchema.nullable().optional(),
    isActive: z.boolean().optional(),
});

export const productIdParamsSchema = z.object({
    id: z.uuid(),
});

export const productReplaceSectionsInputSchema = z.object({
    sectionIds: z.array(z.uuid()).max(200),
});

export const productSectionsOutputSchema = z.object({
    sectionIds: z.array(z.uuid()),
});

export const productOutputSchema = z.object({
    id: z.uuid(),
    name: z.string(),
    price: z.number().int().nonnegative(),
    stock: z.number().int().nonnegative(),
    discountPercentage: z.number().int().min(0).max(100),
    image: z.string().nullable(),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type ProductCreateInput = z.infer<typeof productCreateInputSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateInputSchema>;
export type ProductReplaceSectionsInput = z.infer<
  typeof productReplaceSectionsInputSchema
>;
