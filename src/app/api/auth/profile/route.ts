import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { verifyToken, signToken } from "@/lib/auth/jwt";
import {
  getUserById,
  getUserMemoryProfile,
  updateUserProfile,
  upsertUserMemoryProfile,
} from "@/lib/auth/db";
import { corsGuard, handleCorsOptions, withCorsHeaders } from "@/lib/auth/cors";

const MAX_NAME_LENGTH = 80;
const MAX_MEMORY_LENGTH = 200;
const MIN_PASSWORD_LENGTH = 6;

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request);
}

const getAuthPayload = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("__lt_session")?.value;

  if (!token) return null;
  return verifyToken(token);
};

export async function GET(request: NextRequest) {
  const guard = corsGuard(request);
  if (guard) return guard;

  try {
    const payload = await getAuthPayload();
    if (!payload) {
      return withCorsHeaders(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        request,
      );
    }

    const [user, memoryProfile] = await Promise.all([
      getUserById(payload.userId),
      getUserMemoryProfile(payload.userId),
    ]);

    if (!user) {
      return withCorsHeaders(
        NextResponse.json({ error: "User not found" }, { status: 404 }),
        request,
      );
    }

    return withCorsHeaders(
      NextResponse.json({
        user: {
          id: user._id?.toString(),
          name: user.name,
          email: user.email,
        },
        memory: memoryProfile?.memory ?? "",
      }),
      request,
    );
  } catch (error) {
    console.error("Profile GET error:", error);
    return withCorsHeaders(
      NextResponse.json({ error: "Internal server error" }, { status: 500 }),
      request,
    );
  }
}

export async function PUT(request: NextRequest) {
  const guard = corsGuard(request);
  if (guard) return guard;

  try {
    const payload = await getAuthPayload();
    if (!payload) {
      return withCorsHeaders(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        request,
      );
    }

    const body = (await request.json()) as {
      name?: unknown;
      memory?: unknown;
      currentPassword?: unknown;
      newPassword?: unknown;
    };

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const memory = typeof body.memory === "string" ? body.memory.trim() : "";
    const currentPassword =
      typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword =
      typeof body.newPassword === "string" ? body.newPassword : "";

    if (!name) {
      return withCorsHeaders(
        NextResponse.json({ error: "Name is required." }, { status: 400 }),
        request,
      );
    }

    if (name.length > MAX_NAME_LENGTH) {
      return withCorsHeaders(
        NextResponse.json(
          { error: `Name must be ${MAX_NAME_LENGTH} characters or less.` },
          { status: 400 },
        ),
        request,
      );
    }

    if (memory.length > MAX_MEMORY_LENGTH) {
      return withCorsHeaders(
        NextResponse.json(
          { error: `Memory must be ${MAX_MEMORY_LENGTH} characters or less.` },
          { status: 400 },
        ),
        request,
      );
    }

    const user = await getUserById(payload.userId);
    if (!user) {
      return withCorsHeaders(
        NextResponse.json({ error: "User not found" }, { status: 404 }),
        request,
      );
    }

    const updates: { name?: string; passwordHash?: string } = { name };
    if (newPassword) {
      if (newPassword.length < MIN_PASSWORD_LENGTH) {
        return withCorsHeaders(
          NextResponse.json(
            {
              error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
            },
            { status: 400 },
          ),
          request,
        );
      }

      const passwordMatches = await bcrypt.compare(
        currentPassword,
        user.passwordHash,
      );
      if (!passwordMatches) {
        return withCorsHeaders(
          NextResponse.json(
            { error: "Current password is incorrect." },
            { status: 400 },
          ),
          request,
        );
      }

      updates.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    await Promise.all([
      updateUserProfile(payload.userId, updates),
      upsertUserMemoryProfile(payload.userId, memory),
    ]);

    const token = signToken({
      userId: payload.userId,
      name,
      email: user.email,
    });

    const response = withCorsHeaders(
      NextResponse.json({
        user: { id: payload.userId, name, email: user.email },
        memory,
      }),
      request,
    );

    response.cookies.set("__lt_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Profile PUT error:", error);
    return withCorsHeaders(
      NextResponse.json({ error: "Internal server error" }, { status: 500 }),
      request,
    );
  }
}
