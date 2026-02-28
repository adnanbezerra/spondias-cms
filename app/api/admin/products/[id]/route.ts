import { ProductService } from "@/src/server/services/product-service";
import { isLeft } from "@/src/server/shared/either";
import { toErrorResponse } from "@/src/server/shared/http";
import {
    productIdParamsSchema,
    productUpdateInputSchema,
} from "@/src/server/validators/product";

const productService = new ProductService();

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Params) {
    try {
        const params = productIdParamsSchema.parse(await context.params);
        const parsedInput = productUpdateInputSchema.parse(
            await request.json(),
        );
        const result = await productService.update(params.id, parsedInput);

        if (isLeft(result)) {
            return toErrorResponse(result.value);
        }

        return Response.json(result.value, { status: 200 });
    } catch (error) {
        return toErrorResponse(error);
    }
}

export async function DELETE(_request: Request, context: Params) {
    try {
        const params = productIdParamsSchema.parse(await context.params);
        const result = await productService.delete(params.id);

        if (isLeft(result)) {
            return toErrorResponse(result.value);
        }

        return Response.json(result.value, { status: 200 });
    } catch (error) {
        return toErrorResponse(error);
    }
}
