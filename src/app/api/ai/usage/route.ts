import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { getWindowTokenUsage } from "@/lib/auth/db";
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
    if (!token)
      return withCorsHeaders(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        request,
      );

    const payload = verifyToken(token);
    if (!payload)
      return withCorsHeaders(
        NextResponse.json({ error: "Invalid token" }, { status: 401 }),
        request,
      );

    const role = payload.role ?? "free";
    const isPlus = role === "plus";
    const tokenLimit = role === "lite" ? 700_000 : 3_000;
    const windowHours = role === "lite" ? 5 : 10;
    const usage = await getWindowTokenUsage(payload.userId);
    const resetAt = new Date(
      usage.windowStart.getTime() + windowHours * 60 * 60 * 1000,
    );

    return withCorsHeaders(
      NextResponse.json({
        tokensUsed: isPlus ? 0 : usage.tokensUsed,
        tokenLimit: isPlus ? null : tokenLimit,
        windowHours: isPlus ? null : windowHours,
        resetAt: isPlus ? null : resetAt.toISOString(),
        role,
      }),
      request,
    );
  } catch (error) {
    console.error("Get Token Usage Error:", error);
    return withCorsHeaders(
      NextResponse.json({ error: "Internal Server Error" }, { status: 500 }),
      request,
    );
  }
}
