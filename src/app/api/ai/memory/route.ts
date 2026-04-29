import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { getUserMemoryProfile } from "@/lib/auth/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("__lt_session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const profile = await getUserMemoryProfile(payload.userId);

    return NextResponse.json({
      memory: profile?.memory ?? "",
      updatedAt: profile?.updatedAt ?? null,
    });
  } catch (error) {
    console.error("AI Memory GET Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
