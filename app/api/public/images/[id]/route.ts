import mongoose from "mongoose";
import { getMongooseConnection } from "@/src/server/db/mongoose";
import { ImageModel } from "@/src/server/models/image";
import { toErrorResponse } from "@/src/server/shared/http";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Params) {
    try {
        const { id } = await context.params;
        if (!mongoose.isValidObjectId(id)) {
            return Response.json(
                { code: "NOT_FOUND", message: "Imagem não encontrada." },
                { status: 404 },
            );
        }

        await getMongooseConnection();
        const image = await ImageModel.findById(id);
        if (!image) {
            return Response.json(
                { code: "NOT_FOUND", message: "Imagem não encontrada." },
                { status: 404 },
            );
        }

        return new Response(Buffer.from(image.data), {
            status: 200,
            headers: {
                "content-type": image.mimeType,
                "cache-control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        return toErrorResponse(error);
    }
}
