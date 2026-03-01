import { SectionService } from "@/src/server/services/section-service";
import { isLeft } from "@/src/server/shared/either";
import { toErrorResponse } from "@/src/server/shared/http";
import {
    sectionIdParamsSchema,
    sectionUpdateInputSchema,
} from "@/src/server/validators/section";

const sectionService = new SectionService();

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Params) {
    try {
        const params = sectionIdParamsSchema.parse(await context.params);
        const result = await sectionService.getById(params.id);

        if (isLeft(result)) {
            return toErrorResponse(result.value);
        }

        return Response.json(result.value, { status: 200 });
    } catch (error) {
        return toErrorResponse(error);
    }
}

export async function PATCH(request: Request, context: Params) {
    try {
        const params = sectionIdParamsSchema.parse(await context.params);
        const parsedInput = sectionUpdateInputSchema.parse(
            await request.json(),
        );
        const result = await sectionService.update(params.id, parsedInput);

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
        const params = sectionIdParamsSchema.parse(await context.params);
        const result = await sectionService.delete(params.id);

        if (isLeft(result)) {
            return toErrorResponse(result.value);
        }

        return Response.json(result.value, { status: 200 });
    } catch (error) {
        return toErrorResponse(error);
    }
}
