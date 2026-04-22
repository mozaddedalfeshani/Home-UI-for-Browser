import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getVerifyCode, verifyUser, deleteVerifyCode, getUserByEmail } from "@/lib/auth/db";
import { signToken } from "@/lib/auth/jwt";
import { corsGuard, handleCorsOptions, withCorsHeaders } from "@/lib/auth/cors";

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request);
}

export async function POST(request: NextRequest) {
  const guard = corsGuard(request);
  if (guard) return guard;

  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return withCorsHeaders(
        NextResponse.json({ error: "Email and code are required" }, { status: 400 }),
        request
      );
    }

    const storedCode = await getVerifyCode(email);

    if (!storedCode || storedCode.code !== code) {
      return withCorsHeaders(
        NextResponse.json({ error: "Invalid verification code" }, { status: 400 }),
        request
      );
    }

    if (new Date() > storedCode.expiresAt) {
      return withCorsHeaders(
        NextResponse.json({ error: "Verification code expired" }, { status: 400 }),
        request
      );
    }

    await verifyUser(email);
    await deleteVerifyCode(email);

    const user = await getUserByEmail(email);
    if (!user) {
      return withCorsHeaders(
        NextResponse.json({ error: "User not found" }, { status: 404 }),
        request
      );
    }

    const token = signToken({ userId: user._id!.toString(), email: user.email });

    const response = withCorsHeaders(
      NextResponse.json({
        message: "Verified successfully",
        token,
        user: { email: user.email },
      }),
      request
    );

    response.cookies.set("__lt_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Verification error:", error);
    return withCorsHeaders(
      NextResponse.json({ error: "Internal server error" }, { status: 500 }),
      request
    );
  }
}
