import { z } from "zod";

export const categoryCreateInputSchema = z.object({
  name: z.string().min(2),
  isActive: z.boolean().optional().default(true),
});

export const categoryUpdateInputSchema = z.object({
  name: z.string().min(2).optional(),
  isActive: z.boolean().optional(),
});

export const categoryIdParamsSchema = z.object({
  id: z.uuid(),
});

export const categoryOutputSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CategoryCreateInput = z.infer<typeof categoryCreateInputSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateInputSchema>;
