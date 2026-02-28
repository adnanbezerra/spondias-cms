import { ProductService } from "@/src/server/services/product-service";
import { isLeft } from "@/src/server/shared/either";
import { toErrorResponse } from "@/src/server/shared/http";
import {
    productIdParamsSchema,
    productReplaceSectionsInputSchema,
} from "@/src/server/validators/product";

const productService = new ProductService();

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: Params) {
    try {
        const params = productIdParamsSchema.parse(await context.params);
        const parsedInput = productReplaceSectionsInputSchema.parse(
            await request.json(),
        );
        const result = await productService.replaceSections(
            params.id,
            parsedInput.sectionIds,
        );

        if (isLeft(result)) {
            return toErrorResponse(result.value);
        }

        return Response.json(result.value, { status: 200 });
    } catch (error) {
        return toErrorResponse(error);
    }
}
