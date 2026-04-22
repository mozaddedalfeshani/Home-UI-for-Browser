import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/lib/auth/db";
import { signToken } from "@/lib/auth/jwt";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await getUserByEmail(email);

    if (!user || !user.verified) {
      return NextResponse.json({ error: "Invalid credentials or unverified account" }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signToken({ userId: user._id!.toString(), email: user.email });

    const response = NextResponse.json({ 
      message: "Logged in successfully",
      token,
      user: { email: user.email }
    });

    response.cookies.set("__lt_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
