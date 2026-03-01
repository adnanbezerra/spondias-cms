import { AuthService } from "@/src/server/services/auth-service";
import { NextResponse } from "next/server";
import { isLeft } from "@/src/server/shared/either";
import { TooManyRequestsError } from "@/src/server/shared/errors";
import { toErrorResponse } from "@/src/server/shared/http";
import { consumeRateLimit } from "@/src/server/security/rate-limit";
import { loginInputSchema } from "@/src/server/validators/auth";

const authService = new AuthService();
const LOGIN_RATE_LIMIT = 10;
const LOGIN_WINDOW_MS = 60_000;

const getClientIp = (request: Request): string => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
};

export async function POST(request: Request) {
  try {
    const rateLimit = await consumeRateLimit({
      key: `auth:login:${getClientIp(request)}`,
      limit: LOGIN_RATE_LIMIT,
      windowMs: LOGIN_WINDOW_MS,
    });
    if (!rateLimit.allowed) {
      const response = toErrorResponse(new TooManyRequestsError());
      response.headers.set("Retry-After", String(rateLimit.retryAfterSeconds));
      return response;
    }

    const parsedInput = loginInputSchema.parse(await request.json());
    const result = await authService.login(parsedInput);

    if (isLeft(result)) {
      return toErrorResponse(result.value);
    }

    const response = NextResponse.json(result.value, { status: 200 });
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
