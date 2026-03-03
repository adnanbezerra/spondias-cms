import { extname } from "node:path";
import { randomUUID } from "node:crypto";
import { getMongooseConnection } from "@/src/server/db/mongoose";
import { ImageModel } from "@/src/server/models/image";
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
        const fileBytes = await input.file.arrayBuffer();
        const fileBuffer = Buffer.from(fileBytes);

        await getMongooseConnection();
        const createdImage = await ImageModel.create({
            fileName,
            mimeType: input.mimeType,
            size: input.size,
            data: fileBuffer,
        });

        return right(
            imageUploadOutputSchema.parse({
                url: `/api/public/images/${createdImage.id}`,
                fileName,
                mimeType: input.mimeType,
                size: input.size,
            }),
        );
    }
}
