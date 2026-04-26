import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/lib/auth/db";
import { signToken } from "@/lib/auth/jwt";
import { corsGuard, handleCorsOptions, withCorsHeaders } from "@/lib/auth/cors";

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request);
}

export async function POST(request: NextRequest) {
  const guard = corsGuard(request);
  if (guard) return guard;

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return withCorsHeaders(
        NextResponse.json(
          { error: "Email and password are required" },
          { status: 400 },
        ),
        request,
      );
    }

    const user = await getUserByEmail(email);

    if (!user || !user.verified) {
      return withCorsHeaders(
        NextResponse.json(
          { error: "Invalid credentials or unverified account" },
          { status: 401 },
        ),
        request,
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return withCorsHeaders(
        NextResponse.json({ error: "Invalid credentials" }, { status: 401 }),
        request,
      );
    }

    const token = signToken({
      userId: user._id!.toString(),
      name: user.name,
      email: user.email,
    });

    const response = withCorsHeaders(
      NextResponse.json({
        message: "Logged in successfully",
        token,
        user: { name: user.name, email: user.email },
      }),
      request,
    );

    response.cookies.set("__lt_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return withCorsHeaders(
      NextResponse.json({ error: "Internal server error" }, { status: 500 }),
      request,
    );
  }
}
