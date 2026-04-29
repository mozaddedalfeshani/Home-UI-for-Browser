import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { pullUserData } from "@/lib/auth/sync";
import { UserData } from "@/lib/auth/db";
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
        NextResponse.json<{ authenticated: boolean }>({ authenticated: false }),
        request,
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return withCorsHeaders(
        NextResponse.json<{ authenticated: boolean }>({ authenticated: false }),
        request,
      );
    }

    const userData = await pullUserData(payload.userId);

    return withCorsHeaders(
      NextResponse.json<{
        authenticated: boolean;
        user: { name: string; email: string; id: string };
        data: UserData | null;
      }>({
        authenticated: true,
        user: { name: payload.name, email: payload.email, id: payload.userId },
        data: userData,
      }),
      request,
    );
  } catch (error) {
    console.error("Init API error:", error);
    return withCorsHeaders(
      NextResponse.json<{ authenticated: boolean }>(
        { authenticated: false },
        { status: 500 },
      ),
      request,
    );
  }
}
