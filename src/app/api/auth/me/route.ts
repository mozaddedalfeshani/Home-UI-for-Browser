import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { corsGuard, handleCorsOptions, withCorsHeaders } from "@/lib/auth/cors";

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request);
}

export async function GET(request: NextRequest) {
  const guard = corsGuard(request);
  if (guard) return guard;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("__lt_session")?.value;

    if (!token) {
      return withCorsHeaders(
        NextResponse.json({ error: "Not authenticated" }, { status: 401 }),
        request
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return withCorsHeaders(
        NextResponse.json({ error: "Invalid token" }, { status: 401 }),
        request
      );
    }

    return withCorsHeaders(
      NextResponse.json({ user: { email: payload.email, id: payload.userId } }),
      request
    );
  } catch (error) {
    return withCorsHeaders(
      NextResponse.json({ error: "Internal server error" }, { status: 500 }),
      request
    );
  }
}
