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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = getBearerToken(request);
  const isAdminApiPath = pathname.startsWith("/api/admin/");

  if (!token) {
    if (isAdminApiPath) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "Token ausente." },
        { status: 401 },
      );
    }

    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    await verifyJwtEdge(token);
    return NextResponse.next();
  } catch {
    if (isAdminApiPath) {
      return NextResponse.json(
        { code: "UNAUTHORIZED", message: "Token inválido." },
        { status: 401 },
      );
    }

    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
