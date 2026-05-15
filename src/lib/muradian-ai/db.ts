import sql from "@/lib/db";

export interface AIChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
}

export interface AIChatSession {
  id: string;
  userId: string;
  title: string;
  messages: AIChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export async function saveChatSession(
  userId: string,
  title: string,
  messages: AIChatMessage[],
  sessionId?: string,
): Promise<{ insertedId: string } | { success: true }> {
  const messagesJson = JSON.stringify(messages);

  if (sessionId) {
    await sql`
      UPDATE ai_chat_sessions
      SET title = ${title}, messages = ${messagesJson}::jsonb, updated_at = NOW()
      WHERE id = ${sessionId} AND user_id = ${userId}
    `;
    return { success: true };
  }

  const rows = await sql`
    INSERT INTO ai_chat_sessions (user_id, title, messages, created_at, updated_at)
    VALUES (${userId}, ${title}, ${messagesJson}::jsonb, NOW(), NOW())
    RETURNING id
  `;
  return { insertedId: (rows[0] as { id: string }).id };
}

export async function getChatSessions(
  userId: string,
): Promise<AIChatSession[]> {
  const rows = await sql`
    SELECT id, user_id AS "userId", title, messages,
           created_at AS "createdAt", updated_at AS "updatedAt"
    FROM ai_chat_sessions WHERE user_id = ${userId}
    ORDER BY updated_at DESC
  `;
  return rows as AIChatSession[];
}

export async function getChatSessionById(
  userId: string,
  sessionId: string,
): Promise<AIChatSession | null> {
  const rows = await sql`
    SELECT id, user_id AS "userId", title, messages,
           created_at AS "createdAt", updated_at AS "updatedAt"
    FROM ai_chat_sessions WHERE id = ${sessionId} AND user_id = ${userId}
  `;
  return (rows[0] as AIChatSession) ?? null;
}

export async function deleteChatSession(
  userId: string,
  sessionId: string,
): Promise<void> {
  await sql`
    DELETE FROM ai_chat_sessions WHERE id = ${sessionId} AND user_id = ${userId}
  `;
}
