import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { pushUserData } from "@/lib/auth/sync";
import { corsGuard, handleCorsOptions, withCorsHeaders } from "@/lib/auth/cors";
import { ShareProfileTab, ShareProfileSettings } from "@/lib/shareProfile";

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request);
}

export async function POST(request: NextRequest) {
  const guard = corsGuard(request);
  if (guard) return guard;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("__lt_session")?.value;

    if (!token) {
      return withCorsHeaders(
        NextResponse.json<{ error: string }>(
          { error: "Not authenticated" },
          { status: 401 },
        ),
        request,
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return withCorsHeaders(
        NextResponse.json<{ error: string }>(
          { error: "Invalid token" },
          { status: 401 },
        ),
        request,
      );
    }

    const { tabs, settings } = (await request.json()) as {
      tabs: ShareProfileTab[];
      settings: ShareProfileSettings;
    };
    await pushUserData(payload.userId, { tabs, settings });

    return withCorsHeaders(
      NextResponse.json<{ ok: boolean }>({ ok: true }),
      request,
    );
  } catch (error) {
    console.error("Sync push error:", error);
    return withCorsHeaders(
      NextResponse.json<{ error: string }>(
        { error: "Internal server error" },
        { status: 500 },
      ),
      request,
    );
  }
}
