import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { getUserMemoryProfile, upsertUserMemoryProfile } from "@/lib/auth/db";

const MAX_MEMORY_LENGTH = 200;

const getUserId = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("__lt_session")?.value;

  if (!token) {
    return { error: "Unauthorized", status: 401 as const };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return { error: "Invalid token", status: 401 as const };
  }

  return { userId: payload.userId };
};

export async function GET() {
  try {
    const auth = await getUserId();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const profile = await getUserMemoryProfile(auth.userId);

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

export async function PUT(request: Request) {
  try {
    const auth = await getUserId();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { memory } = (await request.json()) as { memory?: unknown };
    if (typeof memory !== "string") {
      return NextResponse.json(
        { error: "Memory must be text." },
        { status: 400 },
      );
    }

    const trimmedMemory = memory.trim();
    if (trimmedMemory.length > MAX_MEMORY_LENGTH) {
      return NextResponse.json(
        { error: `Memory must be ${MAX_MEMORY_LENGTH} characters or less.` },
        { status: 400 },
      );
    }

    await upsertUserMemoryProfile(auth.userId, trimmedMemory);

    return NextResponse.json({
      memory: trimmedMemory,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI Memory PUT Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
