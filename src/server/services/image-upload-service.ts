import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { randomUUID } from "node:crypto";
import { left, right, type Either } from "@/src/server/shared/either";
import { ValidationError } from "@/src/server/shared/errors";
import {
    imageUploadOutputSchema,
    type ImageUploadInput,
    type ImageUploadOutput,
} from "@/src/server/validators/upload";

export type ImageUploadError = ValidationError;

const MIME_TO_EXTENSION: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
};

const getUploadsDirectoryPath = (): string =>
    join(process.cwd(), "public", "uploads");

export class ImageUploadService {
    async uploadImage(
        input: ImageUploadInput,
    ): Promise<Either<ImageUploadError, ImageUploadOutput>> {
        const extensionFromMimeType = MIME_TO_EXTENSION[input.mimeType];
        if (!extensionFromMimeType) {
            return left(new ValidationError("Tipo de imagem não suportado."));
        }

        const originalExtension = extname(input.originalName).toLowerCase();
        const extension =
            originalExtension && originalExtension.length <= 5
                ? originalExtension
                : extensionFromMimeType;
        const fileName = `${randomUUID()}${extension}`;
        const uploadsPath = getUploadsDirectoryPath();
        const targetPath = join(uploadsPath, fileName);

        await mkdir(uploadsPath, { recursive: true });
        const fileBytes = await input.file.arrayBuffer();
        await writeFile(targetPath, Buffer.from(fileBytes));

        return right(
            imageUploadOutputSchema.parse({
                url: `/uploads/${fileName}`,
                fileName,
                mimeType: input.mimeType,
                size: input.size,
            }),
        );
    }
}
