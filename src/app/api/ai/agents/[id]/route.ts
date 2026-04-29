import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { corsGuard, handleCorsOptions, withCorsHeaders } from "@/lib/auth/cors";
import {
  deleteMuradianAskAgent,
  MuradianAskAgentPayload,
  updateMuradianAskAgent,
} from "@/lib/muradian-ask/db";

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request);
}

const getUserId = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("__lt_session")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  return payload?.userId ?? null;
};

const cleanPayload = (payload: Partial<MuradianAskAgentPayload>) => ({
  name: payload.name?.trim() ?? "",
  description: payload.description?.trim() ?? "",
  systemInstruction: payload.systemInstruction?.trim() ?? "",
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = corsGuard(request);
  if (guard) return guard;

  try {
    const userId = await getUserId();
    if (!userId) {
      return withCorsHeaders(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        request,
      );
    }

    const { id } = await params;
    const payload = cleanPayload(await request.json());
    if (!payload.name || !payload.systemInstruction) {
      return withCorsHeaders(
        NextResponse.json(
          { error: "Agent name and rules are required." },
          { status: 400 },
        ),
        request,
      );
    }

    await updateMuradianAskAgent(userId, id, payload);

    return withCorsHeaders(
      NextResponse.json({
        agent: {
          id,
          ...payload,
          updatedAt: new Date().toISOString(),
        },
      }),
      request,
    );
  } catch (error) {
    console.error("MuradianAsk Agent PUT Error:", error);
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
    const userId = await getUserId();
    if (!userId) {
      return withCorsHeaders(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        request,
      );
    }

    const { id } = await params;
    await deleteMuradianAskAgent(userId, id);

    return withCorsHeaders(NextResponse.json({ success: true }), request);
  } catch (error) {
    console.error("MuradianAsk Agent DELETE Error:", error);
    return withCorsHeaders(
      NextResponse.json({ error: "Internal Server Error" }, { status: 500 }),
      request,
    );
  }
}
