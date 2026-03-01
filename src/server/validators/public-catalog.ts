import { z } from "zod";

export const publicCatalogIdParamsSchema = z.object({
    id: z.uuid(),
});

export const publicProductOutputSchema = z.object({
    id: z.uuid(),
    name: z.string(),
    priceInCents: z.number().int().nonnegative(),
    discountPercentage: z.number().int().min(0).max(100),
    stock: z.number().int().nonnegative(),
    image: z.string(),
    description: z.string(),
});

export const publicCategoryOutputSchema = z.object({
    id: z.uuid(),
    name: z.string(),
});
export const publicCategoriesOutputSchema = z.array(publicCategoryOutputSchema);

export const publicSectionOutputSchema = z.object({
    id: z.uuid(),
    name: z.string(),
    description: z.string(),
    isBanner: z.boolean(),
    bannerImage: z.string().nullable(),
    products: z.array(publicProductOutputSchema),
});

export const publicCategoryDetailsOutputSchema = z.object({
    id: z.uuid(),
    name: z.string(),
    products: z.array(publicProductOutputSchema),
});

export type PublicCategoryOutput = z.infer<typeof publicCategoryOutputSchema>;
export type PublicSectionOutput = z.infer<typeof publicSectionOutputSchema>;
export type PublicCategoryDetailsOutput = z.infer<
    typeof publicCategoryDetailsOutputSchema
>;
