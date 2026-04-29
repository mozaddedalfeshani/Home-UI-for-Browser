import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import {
  getChatSessionById,
  saveChatSession,
  deleteChatSession,
} from "@/lib/muradian-ai/db";
import { corsGuard, handleCorsOptions, withCorsHeaders } from "@/lib/auth/cors";

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = corsGuard(request);
  if (guard) return guard;

  try {
    const { id } = await params;
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

    const session = await getChatSessionById(payload.userId, id);
    if (!session)
      return withCorsHeaders(
        NextResponse.json({ error: "Session not found" }, { status: 404 }),
        request,
      );

    return withCorsHeaders(NextResponse.json({ session }), request);
  } catch (error) {
    console.error("AI Session GET Error:", error);
    return withCorsHeaders(
      NextResponse.json({ error: "Internal Server Error" }, { status: 500 }),
      request,
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = corsGuard(request);
  if (guard) return guard;

  try {
    const { id } = await params;
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
    await saveChatSession(payload.userId, title, messages, id);

    return withCorsHeaders(NextResponse.json({ success: true }), request);
  } catch (error) {
    console.error("AI Session PUT Error:", error);
    return withCorsHeaders(
      NextResponse.json({ error: "Internal Server Error" }, { status: 500 }),
      request,
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = corsGuard(request);
  if (guard) return guard;

  try {
    const { id } = await params;
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

    await deleteChatSession(payload.userId, id);
    return withCorsHeaders(NextResponse.json({ success: true }), request);
  } catch (error) {
    console.error("AI Session DELETE Error:", error);
    return withCorsHeaders(
      NextResponse.json({ error: "Internal Server Error" }, { status: 500 }),
      request,
    );
  }
}
