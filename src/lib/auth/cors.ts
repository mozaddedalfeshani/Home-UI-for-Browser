import { NextRequest, NextResponse } from "next/server";

/**
 * Allowed origins for auth API routes.
 * NEXT_PUBLIC_APP_URL must be set in production (e.g. "https://yourdomain.com").
 * In development, localhost on any port is always allowed.
 */
function getAllowedOrigins(): string[] {
  const origins: string[] = [];

  if (process.env.NEXT_PUBLIC_APP_URL) {
    origins.push(process.env.NEXT_PUBLIC_APP_URL);
  }

  // Always allow localhost in development
  if (process.env.NODE_ENV !== "production") {
    origins.push("http://localhost:3000");
    origins.push("http://localhost:3001");
    origins.push("http://127.0.0.1:3000");
  }

  return origins;
}

/**
 * Returns a 403 response if the request origin is not allowed.
 * Returns null if the request is OK to proceed.
 */
export function corsGuard(request: NextRequest): NextResponse | null {
  const origin = request.headers.get("origin");

  // Requests with no Origin header (e.g. same-site SSR, server-to-server)
  // are allowed through — browsers always send Origin for cross-site fetch.
  if (!origin) {
    return null;
  }

  const allowed = getAllowedOrigins();

  // Allow same-origin (origin matches the host exactly)
  const host = request.headers.get("host");
  if (host && origin.includes(host)) {
    return null;
  }

  if (allowed.includes(origin)) {
    return null;
  }

  return NextResponse.json(
    { error: "Forbidden" },
    { status: 403 }
  );
}

/**
 * Attach CORS headers to an existing response so browsers accept preflight.
 */
export function withCorsHeaders(
  response: NextResponse,
  request: NextRequest
): NextResponse {
  const origin = request.headers.get("origin") ?? "";
  const allowed = getAllowedOrigins();

  if (allowed.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
  }

  return response;
}

/**
 * Handle CORS preflight (OPTIONS) requests.
 */
export function handleCorsOptions(request: NextRequest): NextResponse {
  const guard = corsGuard(request);
  if (guard) return guard;

  const response = new NextResponse(null, { status: 204 });
  return withCorsHeaders(response, request);
}
