import { ImageUploadService } from "@/src/server/services/image-upload-service";
import { isLeft } from "@/src/server/shared/either";
import { ValidationError } from "@/src/server/shared/errors";
import { toErrorResponse } from "@/src/server/shared/http";
import { imageUploadInputSchema } from "@/src/server/validators/upload";

const imageUploadService = new ImageUploadService();

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const fileEntry = formData.get("file");

        if (!(fileEntry instanceof File)) {
            return toErrorResponse(
                new ValidationError(
                    "Campo 'file' ausente no multipart/form-data.",
                ),
            );
        }

        const parsedInput = imageUploadInputSchema.parse({
            file: fileEntry,
            mimeType: fileEntry.type,
            size: fileEntry.size,
            originalName: fileEntry.name,
        });

        const result = await imageUploadService.uploadImage(parsedInput);
        if (isLeft(result)) {
            return toErrorResponse(result.value);
        }

        return Response.json(result.value, { status: 201 });
    } catch (error) {
        return toErrorResponse(error);
    }
}
