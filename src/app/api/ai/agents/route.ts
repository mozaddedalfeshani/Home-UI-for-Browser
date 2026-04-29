import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { corsGuard, handleCorsOptions, withCorsHeaders } from "@/lib/auth/cors";
import {
  createMuradianAskAgent,
  getMuradianAskAgents,
  MuradianAskAgentPayload,
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

export async function GET(request: NextRequest) {
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

    const agents = await getMuradianAskAgents(userId);

    return withCorsHeaders(
      NextResponse.json({
        agents: agents.map((agent) => ({
          id: agent._id?.toString(),
          name: agent.name,
          description: agent.description,
          systemInstruction: agent.systemInstruction,
          createdAt: agent.createdAt.toISOString(),
          updatedAt: agent.updatedAt.toISOString(),
        })),
      }),
      request,
    );
  } catch (error) {
    console.error("MuradianAsk Agents GET Error:", error);
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
    const userId = await getUserId();
    if (!userId) {
      return withCorsHeaders(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        request,
      );
    }

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

    const result = await createMuradianAskAgent(userId, payload);

    return withCorsHeaders(
      NextResponse.json({
        agent: {
          id: result.insertedId.toString(),
          ...payload,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),
      request,
    );
  } catch (error) {
    console.error("MuradianAsk Agents POST Error:", error);
    return withCorsHeaders(
      NextResponse.json({ error: "Internal Server Error" }, { status: 500 }),
      request,
    );
  }
}
