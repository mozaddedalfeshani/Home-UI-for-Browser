import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail, createUser, saveVerifyCode } from "@/lib/auth/db";
import { sendVerificationEmail } from "@/lib/auth/email";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (password.length < 4 || password.length > 12) {
      return NextResponse.json({ error: "Password must be between 4 and 12 digits" }, { status: 400 });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser && existingUser.verified) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    if (!existingUser) {
      await createUser(email, passwordHash);
    }

    // Generate 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await saveVerifyCode(email, code, expiresAt);
    await sendVerificationEmail(email, code);

    return NextResponse.json({ message: "Verification code sent to your email" });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
