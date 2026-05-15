import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { corsGuard, handleCorsOptions, withCorsHeaders } from "@/lib/auth/cors";
import {
  searchPublicMuradianAskAgents,
  listPublicMuradianAskAgents,
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

    const query = request.nextUrl.searchParams.get("query")?.trim() ?? "";
    const limit = Math.min(
      parseInt(request.nextUrl.searchParams.get("limit") ?? "12", 10),
      50,
    );
    const offset = Math.max(
      parseInt(request.nextUrl.searchParams.get("offset") ?? "0", 10),
      0,
    );

    const { agents, total } =
      query.length >= 2
        ? await searchPublicMuradianAskAgents(userId, query, limit, offset)
        : await listPublicMuradianAskAgents(userId, limit, offset);

    return withCorsHeaders(
      NextResponse.json({
        agents: agents.map((agent) => ({
          id: agent.id,
          name: agent.name,
          description: agent.description,
          visibility: "public",
          createdAt: agent.createdAt.toISOString(),
          updatedAt: agent.updatedAt.toISOString(),
        })),
        total,
        limit,
        offset,
      }),
      request,
    );
  } catch (error) {
    console.error("MuradianAsk Public Agents GET Error:", error);
    return withCorsHeaders(
      NextResponse.json({ error: "Internal Server Error" }, { status: 500 }),
      request,
    );
  }
}
