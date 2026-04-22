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
      NextResponse.json<{ data: UserData | null }>({ data: userData }),
      request,
    );
  } catch (error) {
    console.error("Sync pull error:", error);
    return withCorsHeaders(
      NextResponse.json<{ error: string }>(
        { error: "Internal server error" },
        { status: 500 },
      ),
      request,
    );
  }
}
