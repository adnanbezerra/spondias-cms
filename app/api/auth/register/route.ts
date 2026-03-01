import { AuthService } from "@/src/server/services/auth-service";
import { NextResponse } from "next/server";
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

    const response = NextResponse.json(result.value, { status: 201 });
    response.cookies.set("spondias_token", result.value.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: Number(process.env.JWT_EXPIRES_IN_SECONDS ?? 86400),
    });

    return response;
  } catch (error) {
    return toErrorResponse(error);
  }
}
