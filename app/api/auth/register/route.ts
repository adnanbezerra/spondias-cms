import { AuthService } from "@/src/server/services/auth-service";
import { isLeft } from "@/src/server/shared/either";
import { toErrorResponse } from "@/src/server/shared/http";
import { registerInputSchema } from "@/src/server/validators/auth";

const authService = new AuthService();

export async function POST(request: Request) {
  try {
    const parsedInput = registerInputSchema.parse(await request.json());
    const result = await authService.register(parsedInput);

    if (isLeft(result)) {
      return toErrorResponse(result.value);
    }

    return Response.json(result.value, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
