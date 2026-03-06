import { getPublicProductDetailsById } from "@/src/server/public/public-content";
import { publicCatalogIdParamsSchema } from "@/src/server/validators/public-catalog";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Params) {
    try {
        const { id } = publicCatalogIdParamsSchema.parse(await context.params);
        const details = await getPublicProductDetailsById(id);

        if (!details) {
            return Response.json({ message: "Produto não encontrado." }, { status: 404 });
        }

        return Response.json(details, { status: 200 });
    } catch {
        return Response.json({ message: "Falha ao carregar produto." }, { status: 400 });
    }
}
