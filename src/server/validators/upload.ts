import { z } from "zod";

const ACCEPTED_IMAGE_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
] as const;

const MAX_UPLOAD_IMAGE_SIZE_IN_BYTES = 5 * 1024 * 1024;

export const imageUploadInputSchema = z.object({
    file: z.instanceof(File),
    mimeType: z.enum(ACCEPTED_IMAGE_MIME_TYPES),
    size: z
        .number()
        .int()
        .positive()
        .max(
            MAX_UPLOAD_IMAGE_SIZE_IN_BYTES,
            "Imagem excede o limite de 5MB.",
        ),
    originalName: z.string().min(1),
});

export const imageUploadOutputSchema = z.object({
    url: z.string(),
    fileName: z.string(),
    mimeType: z.enum(ACCEPTED_IMAGE_MIME_TYPES),
    size: z.number().int().positive(),
});

export type ImageUploadInput = z.infer<typeof imageUploadInputSchema>;
export type ImageUploadOutput = z.infer<typeof imageUploadOutputSchema>;
