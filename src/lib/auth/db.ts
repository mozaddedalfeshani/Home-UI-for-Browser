import sql from "@/lib/db";
import type { ShareProfileTab, ShareProfileSettings } from "@/lib/shareProfile";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  verified: boolean;
  createdAt: Date;
  role: "free" | "lite" | "plus";
}

export interface TokenUsage {
  userId: string;
  month: string;
  tokensUsed: number;
}

export interface VerifyCode {
  email: string;
  code: string;
  expiresAt: Date;
}

export interface UserData {
  userId: string;
  tabs: ShareProfileTab[];
  settings: ShareProfileSettings | null;
  updatedAt: Date;
}

export interface UserMemoryProfile {
  userId: string;
  memory: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const rows = await sql`
    SELECT id, name, email, password_hash AS "passwordHash", verified, created_at AS "createdAt",
           COALESCE(role, 'lite') AS role
    FROM users WHERE email = ${email}
  `;
  return (rows[0] as User) ?? null;
}

export async function getUserById(userId: string): Promise<User | null> {
  const rows = await sql`
    SELECT id, name, email, password_hash AS "passwordHash", verified, created_at AS "createdAt",
           COALESCE(role, 'lite') AS role
    FROM users WHERE id = ${userId}
  `;
  return (rows[0] as User) ?? null;
}

export async function updateUserProfile(
  userId: string,
  updates: { name?: string; passwordHash?: string },
): Promise<void> {
  await sql`
    UPDATE users SET
      name = COALESCE(${updates.name ?? null}, name),
      password_hash = COALESCE(${updates.passwordHash ?? null}, password_hash)
    WHERE id = ${userId}
  `;
}

export async function createUser(
  name: string,
  email: string,
  passwordHash: string,
): Promise<void> {
  await sql`
    INSERT INTO users (name, email, password_hash, verified, created_at)
    VALUES (${name}, ${email}, ${passwordHash}, false, NOW())
    ON CONFLICT (email) DO NOTHING
  `;
}

export async function getUserTokenUsage(
  userId: string,
  month: string,
): Promise<number> {
  const rows = await sql`
    SELECT tokens_used FROM token_usage WHERE user_id = ${userId} AND month = ${month}
  `;
  return (rows[0] as { tokens_used: number } | undefined)?.tokens_used ?? 0;
}

export async function incrementTokenUsage(
  userId: string,
  month: string,
  tokens: number,
): Promise<void> {
  await sql`
    INSERT INTO token_usage (user_id, month, tokens_used)
    VALUES (${userId}, ${month}, ${tokens})
    ON CONFLICT (user_id, month) DO UPDATE SET tokens_used = token_usage.tokens_used + ${tokens}
  `;
}

export interface WindowUsage {
  tokensUsed: number;
  windowStart: Date;
  isExpired: boolean;
}

export async function getWindowTokenUsage(
  userId: string,
): Promise<WindowUsage> {
  const rows = await sql`
    SELECT tokens_used, window_start,
      window_start < NOW() - INTERVAL '10 hours' AS is_expired
    FROM token_usage_windows WHERE user_id = ${userId}
  `;
  if (!rows[0]) {
    return { tokensUsed: 0, windowStart: new Date(), isExpired: false };
  }
  const row = rows[0] as {
    tokens_used: number;
    window_start: Date;
    is_expired: boolean;
  };
  return {
    tokensUsed: row.is_expired ? 0 : row.tokens_used,
    windowStart: row.is_expired ? new Date() : new Date(row.window_start),
    isExpired: row.is_expired,
  };
}

// Atomically increment window usage; auto-resets if window expired.
// Returns updated tokens_used after increment.
export async function incrementWindowTokenUsage(
  userId: string,
  tokens: number,
): Promise<number> {
  const rows = await sql`
    INSERT INTO token_usage_windows (user_id, tokens_used, window_start)
    VALUES (${userId}, ${tokens}, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      tokens_used = CASE
        WHEN token_usage_windows.window_start < NOW() - INTERVAL '10 hours'
        THEN EXCLUDED.tokens_used
        ELSE token_usage_windows.tokens_used + EXCLUDED.tokens_used
      END,
      window_start = CASE
        WHEN token_usage_windows.window_start < NOW() - INTERVAL '10 hours'
        THEN NOW()
        ELSE token_usage_windows.window_start
      END
    RETURNING tokens_used, window_start
  `;
  return (rows[0] as { tokens_used: number }).tokens_used;
}

export async function verifyUser(email: string): Promise<void> {
  await sql`UPDATE users SET verified = true WHERE email = ${email}`;
}

export async function saveVerifyCode(
  email: string,
  code: string,
  expiresAt: Date,
): Promise<void> {
  await sql`
    INSERT INTO verify_codes (email, code, expires_at)
    VALUES (${email}, ${code}, ${expiresAt})
    ON CONFLICT (email) DO UPDATE SET code = ${code}, expires_at = ${expiresAt}
  `;
}

export async function getVerifyCode(email: string): Promise<VerifyCode | null> {
  const rows = await sql`
    SELECT email, code, expires_at AS "expiresAt" FROM verify_codes WHERE email = ${email}
  `;
  return (rows[0] as VerifyCode) ?? null;
}

export async function deleteVerifyCode(email: string): Promise<void> {
  await sql`DELETE FROM verify_codes WHERE email = ${email}`;
}

export async function getUserMemoryProfile(
  userId: string,
): Promise<UserMemoryProfile | null> {
  const rows = await sql`
    SELECT user_id AS "userId", memory, created_at AS "createdAt", updated_at AS "updatedAt"
    FROM user_memory_profiles WHERE user_id = ${userId}
  `;
  return (rows[0] as UserMemoryProfile) ?? null;
}

export async function upsertUserMemoryProfile(
  userId: string,
  memory: string,
): Promise<void> {
  await sql`
    INSERT INTO user_memory_profiles (user_id, memory, created_at, updated_at)
    VALUES (${userId}, ${memory}, NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET memory = ${memory}, updated_at = NOW()
  `;
}
