import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { getChatSessions, saveChatSession } from "@/lib/muradian-ai/db";
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

    const sessions = await getChatSessions(payload.userId);
    return withCorsHeaders(NextResponse.json({ sessions }), request);
  } catch (error) {
    console.error("AI Sessions GET Error:", error);
    return withCorsHeaders(
      NextResponse.json({ error: "Internal Server Error" }, { status: 500 }),
      request,
    );
  }
}

export async function POST(request: NextRequest) {
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

    const { title, messages } = await request.json();
    const result = await saveChatSession(payload.userId, title, messages);

    return withCorsHeaders(
      NextResponse.json({
        success: true,
        sessionId: "insertedId" in result ? result.insertedId : null,
      }),
      request,
    );
  } catch (error) {
    console.error("AI Sessions POST Error:", error);
    return withCorsHeaders(
      NextResponse.json({ error: "Internal Server Error" }, { status: 500 }),
      request,
    );
  }
}
