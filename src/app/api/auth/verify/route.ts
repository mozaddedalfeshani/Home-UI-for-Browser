import { NextResponse } from "next/server";
import { getVerifyCode, verifyUser, deleteVerifyCode, getUserByEmail } from "@/lib/auth/db";
import { signToken } from "@/lib/auth/jwt";

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }

    const storedCode = await getVerifyCode(email);

    if (!storedCode || storedCode.code !== code) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    if (new Date() > storedCode.expiresAt) {
      return NextResponse.json({ error: "Verification code expired" }, { status: 400 });
    }

    await verifyUser(email);
    await deleteVerifyCode(email);

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const token = signToken({ userId: user._id!.toString(), email: user.email });

    const response = NextResponse.json({ 
      message: "Verified successfully",
      token,
      user: { email: user.email }
    });

    // Set HttpOnly cookie
    response.cookies.set("__lt_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
