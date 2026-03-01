import { PublicCatalogService } from "@/src/server/services/public-catalog-service";
import { toErrorResponse } from "@/src/server/shared/http";

const publicCatalogService = new PublicCatalogService();

export async function GET() {
    try {
        const result = await publicCatalogService.listCategories();
        return Response.json(result.value, { status: 200 });
    } catch (error) {
        return toErrorResponse(error);
    }
}
