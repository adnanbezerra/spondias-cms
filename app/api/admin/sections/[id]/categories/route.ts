import { SectionService } from "@/src/server/services/section-service";
import { isLeft } from "@/src/server/shared/either";
import { toErrorResponse } from "@/src/server/shared/http";
import {
    sectionIdParamsSchema,
    sectionReplaceCategoriesInputSchema,
} from "@/src/server/validators/section";

const sectionService = new SectionService();

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: Params) {
    try {
        const params = sectionIdParamsSchema.parse(await context.params);
        const parsedInput = sectionReplaceCategoriesInputSchema.parse(
            await request.json(),
        );
        const result = await sectionService.replaceCategories(
            params.id,
            parsedInput.categoryIds,
        );

        if (isLeft(result)) {
            return toErrorResponse(result.value);
        }

        return Response.json(result.value, { status: 200 });
    } catch (error) {
        return toErrorResponse(error);
    }
}
