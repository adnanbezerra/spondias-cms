import { CategoryService } from "@/src/server/services/category-service";
import { isLeft } from "@/src/server/shared/either";
import { toErrorResponse } from "@/src/server/shared/http";
import { categoryCreateInputSchema } from "@/src/server/validators/category";

const categoryService = new CategoryService();

export async function GET() {
    try {
        const result = await categoryService.list();
        return Response.json(result.value, { status: 200 });
    } catch (error) {
        return toErrorResponse(error);
    }
}

export async function POST(request: Request) {
    try {
        const parsedInput = categoryCreateInputSchema.parse(
            await request.json(),
        );
        const result = await categoryService.create(parsedInput);

        if (isLeft(result)) {
            return toErrorResponse(result.value);
        }

        return Response.json(result.value, { status: 201 });
    } catch (error) {
        return toErrorResponse(error);
    }
}
