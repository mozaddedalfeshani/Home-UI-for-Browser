import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { pushUserData } from "@/lib/auth/sync";

export async function POST(request: Request) {
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

    const { tabs, settings } = await request.json();

    await pushUserData(payload.userId, { tabs, settings });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Sync push error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
