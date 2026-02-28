import { ProductService } from "@/src/server/services/product-service";
import { isLeft } from "@/src/server/shared/either";
import { toErrorResponse } from "@/src/server/shared/http";
import { productCreateInputSchema } from "@/src/server/validators/product";

const productService = new ProductService();

export async function GET() {
    try {
        const result = await productService.list();
        return Response.json(result.value, { status: 200 });
    } catch (error) {
        return toErrorResponse(error);
    }
}

export async function POST(request: Request) {
    try {
        const parsedInput = productCreateInputSchema.parse(
            await request.json(),
        );
        const result = await productService.create(parsedInput);

        if (isLeft(result)) {
            return toErrorResponse(result.value);
        }

        return Response.json(result.value, { status: 201 });
    } catch (error) {
        return toErrorResponse(error);
    }
}
