import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { pullUserData } from "@/lib/auth/sync";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("__lt_session")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json({ authenticated: false });
    }

    // Parallelize getting user data
    const userData = await pullUserData(payload.userId);

    return NextResponse.json({ 
      authenticated: true,
      user: { email: payload.email, id: payload.userId },
      data: userData 
    });
  } catch (error) {
    console.error("Init API error:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
