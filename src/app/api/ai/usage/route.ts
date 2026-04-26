import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { getUserTokenUsage } from "@/lib/auth/db";
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
    if (!token) return withCorsHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), request);

    const payload = verifyToken(token);
    if (!payload) return withCorsHeaders(NextResponse.json({ error: "Invalid token" }, { status: 401 }), request);

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const currentUsage = await getUserTokenUsage(payload.userId, currentMonth);

    return withCorsHeaders(NextResponse.json({ 
      tokensUsed: currentUsage, 
      tokenLimit: 100000,
      month: currentMonth
    }), request);
    
  } catch (error) {
    console.error("Get Token Usage Error:", error);
    return withCorsHeaders(NextResponse.json({ error: "Internal Server Error" }, { status: 500 }), request);
  }
}
