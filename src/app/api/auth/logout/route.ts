import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { corsGuard, handleCorsOptions, withCorsHeaders } from "@/lib/auth/cors";

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request);
}

export async function POST(request: NextRequest) {
  const guard = corsGuard(request);
  if (guard) return guard;

  const response = withCorsHeaders(
    NextResponse.json({ message: "Logged out successfully" }),
    request
  );

  response.cookies.set("__lt_session", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  return response;
}
