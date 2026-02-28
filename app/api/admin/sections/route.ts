import { SectionService } from "@/src/server/services/section-service";
import { isLeft } from "@/src/server/shared/either";
import { toErrorResponse } from "@/src/server/shared/http";
import { sectionCreateInputSchema } from "@/src/server/validators/section";

const sectionService = new SectionService();

export async function GET() {
    try {
        const result = await sectionService.list();
        return Response.json(result.value, { status: 200 });
    } catch (error) {
        return toErrorResponse(error);
    }
}

export async function POST(request: Request) {
    try {
        const parsedInput = sectionCreateInputSchema.parse(
            await request.json(),
        );
        const result = await sectionService.create(parsedInput);

        if (isLeft(result)) {
            return toErrorResponse(result.value);
        }

        return Response.json(result.value, { status: 201 });
    } catch (error) {
        return toErrorResponse(error);
    }
}
