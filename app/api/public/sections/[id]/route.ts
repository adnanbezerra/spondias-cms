import { PublicCatalogService } from "@/src/server/services/public-catalog-service";
import { isLeft } from "@/src/server/shared/either";
import { toErrorResponse } from "@/src/server/shared/http";
import { publicCatalogIdParamsSchema } from "@/src/server/validators/public-catalog";

const publicCatalogService = new PublicCatalogService();

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Params) {
    try {
        const params = publicCatalogIdParamsSchema.parse(await context.params);
        const result = await publicCatalogService.getSectionById(params.id);

        if (isLeft(result)) {
            return toErrorResponse(result.value);
        }

        return Response.json(result.value, { status: 200 });
    } catch (error) {
        return toErrorResponse(error);
    }
}
