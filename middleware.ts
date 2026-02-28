import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwtEdge } from "@/src/server/security/jwt-edge";

const getBearerToken = (request: NextRequest): string | null => {
  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    return authorization.replace("Bearer ", "").trim();
  }

  return request.cookies.get("spondias_token")?.value ?? null;
};

export async function middleware(request: NextRequest) {
  const token = getBearerToken(request);

  if (!token) {
    return NextResponse.json(
      { code: "UNAUTHORIZED", message: "Token ausente." },
      { status: 401 },
    );
  }

  try {
    await verifyJwtEdge(token);
    return NextResponse.next();
  } catch {
    return NextResponse.json(
      { code: "UNAUTHORIZED", message: "Token inválido." },
      { status: 401 },
    );
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
