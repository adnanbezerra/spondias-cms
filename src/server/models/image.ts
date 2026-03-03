import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const imageSchema = new Schema(
    {
        fileName: { type: String, required: true },
        mimeType: { type: String, required: true },
        size: { type: Number, required: true },
        data: { type: Buffer, required: true },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

type ImageDocument = InferSchemaType<typeof imageSchema> & { _id: string };

export const ImageModel: Model<ImageDocument> =
    (models.Image as Model<ImageDocument> | undefined) ??
    model<ImageDocument>("Image", imageSchema);
