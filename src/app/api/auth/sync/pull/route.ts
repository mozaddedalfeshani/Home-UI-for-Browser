import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { pullUserData } from "@/lib/auth/sync";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("__lt_session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userData = await pullUserData(payload.userId);

    return NextResponse.json({ data: userData });
  } catch (error) {
    console.error("Sync pull error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
