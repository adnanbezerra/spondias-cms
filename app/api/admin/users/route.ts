import { AdminUserService } from "@/src/server/services/admin-user-service";
import { isLeft } from "@/src/server/shared/either";
import { toErrorResponse } from "@/src/server/shared/http";
import { userCreateInputSchema } from "@/src/server/validators/user";

const adminUserService = new AdminUserService();

export async function GET() {
    try {
        const result = await adminUserService.list();
        return Response.json(result.value, { status: 200 });
    } catch (error) {
        return toErrorResponse(error);
    }
}

export async function POST(request: Request) {
    try {
        const parsedInput = userCreateInputSchema.parse(await request.json());
        const result = await adminUserService.create(parsedInput);

        if (isLeft(result)) {
            return toErrorResponse(result.value);
        }

        return Response.json(result.value, { status: 201 });
    } catch (error) {
        return toErrorResponse(error);
    }
}
