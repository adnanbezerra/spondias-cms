import { z } from "zod";

export const sectionCreateInputSchema = z.object({
    name: z.string().min(2),
    isActive: z.boolean().optional().default(true),
    order: z.number().int().nonnegative(),
    isBanner: z.boolean().optional().default(false),
    bannerImg: z.string().url().nullable().optional(),
});

export const sectionUpdateInputSchema = z.object({
    name: z.string().min(2).optional(),
    isActive: z.boolean().optional(),
    order: z.number().int().nonnegative().optional(),
    isBanner: z.boolean().optional(),
    bannerImg: z.string().url().nullable().optional(),
});

export const sectionIdParamsSchema = z.object({
    id: z.uuid(),
});

export const sectionReplaceCategoriesInputSchema = z.object({
    categoryIds: z.array(z.uuid()).max(200),
});

export const sectionCategoriesOutputSchema = z.object({
    categoryIds: z.array(z.uuid()),
});

export const sectionOutputSchema = z.object({
    id: z.uuid(),
    name: z.string(),
    isActive: z.boolean(),
    order: z.number().int(),
    isBanner: z.boolean(),
    bannerImg: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type SectionCreateInput = z.infer<typeof sectionCreateInputSchema>;
export type SectionUpdateInput = z.infer<typeof sectionUpdateInputSchema>;
export type SectionReplaceCategoriesInput = z.infer<
  typeof sectionReplaceCategoriesInputSchema
>;
