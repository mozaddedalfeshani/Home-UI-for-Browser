import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail, createUser, saveVerifyCode } from "@/lib/auth/db";
import { sendVerificationEmail } from "@/lib/auth/email";
import { corsGuard, handleCorsOptions, withCorsHeaders } from "@/lib/auth/cors";

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request);
}

export async function POST(request: NextRequest) {
  const guard = corsGuard(request);
  if (guard) return guard;

  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return withCorsHeaders(
        NextResponse.json(
          { error: "Name, email, and password are required" },
          { status: 400 },
        ),
        request,
      );
    }

    if (password.length < 4 || password.length > 12) {
      return withCorsHeaders(
        NextResponse.json(
          { error: "Password must be between 4 and 12 characters" },
          { status: 400 },
        ),
        request,
      );
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser && existingUser.verified) {
      return withCorsHeaders(
        NextResponse.json({ error: "User already exists" }, { status: 400 }),
        request,
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    if (!existingUser) {
      await createUser(name, email, passwordHash);
    }

    // Generate 4-digit OTP
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await saveVerifyCode(email, code, expiresAt);
    await sendVerificationEmail(email, code);

    return withCorsHeaders(
      NextResponse.json({ message: "Verification code sent to your email" }),
      request,
    );
  } catch (error) {
    console.error("Signup error:", error);
    return withCorsHeaders(
      NextResponse.json({ error: "Internal server error" }, { status: 500 }),
      request,
    );
  }
}
