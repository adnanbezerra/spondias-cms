import { CategoryService } from "@/src/server/services/category-service";
import { isLeft } from "@/src/server/shared/either";
import { toErrorResponse } from "@/src/server/shared/http";
import { categoryIdParamsSchema, categoryUpdateInputSchema } from "@/src/server/validators/category";

const categoryService = new CategoryService();

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Params) {
  try {
    const params = categoryIdParamsSchema.parse(await context.params);
    const parsedInput = categoryUpdateInputSchema.parse(await request.json());
    const result = await categoryService.update(params.id, parsedInput);

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
    const params = categoryIdParamsSchema.parse(await context.params);
    const result = await categoryService.delete(params.id);

    if (isLeft(result)) {
      return toErrorResponse(result.value);
    }

    return Response.json(result.value, { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
