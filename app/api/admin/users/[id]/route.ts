import { AdminUserService } from "@/src/server/services/admin-user-service";
import { isLeft } from "@/src/server/shared/either";
import { toErrorResponse } from "@/src/server/shared/http";
import {
    userIdParamsSchema,
    userUpdateInputSchema,
} from "@/src/server/validators/user";

const adminUserService = new AdminUserService();

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Params) {
    try {
        const params = userIdParamsSchema.parse(await context.params);
        const parsedInput = userUpdateInputSchema.parse(await request.json());
        const result = await adminUserService.update(params.id, parsedInput);

        if (isLeft(result)) {
            return toErrorResponse(result.value);
        }

        return Response.json(result.value, { status: 200 });
    } catch (error) {
        return toErrorResponse(error);
    }
}
