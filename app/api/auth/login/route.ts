import { AuthService } from "@/src/server/services/auth-service";
import { isLeft } from "@/src/server/shared/either";
import { toErrorResponse } from "@/src/server/shared/http";
import { loginInputSchema } from "@/src/server/validators/auth";

const authService = new AuthService();

export async function POST(request: Request) {
    try {
        const parsedInput = loginInputSchema.parse(await request.json());
        const result = await authService.login(parsedInput);

        if (isLeft(result)) {
            return toErrorResponse(result.value);
        }

        return Response.json(result.value, { status: 200 });
    } catch (error) {
        return toErrorResponse(error);
    }
}
