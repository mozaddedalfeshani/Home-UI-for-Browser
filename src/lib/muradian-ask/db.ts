import sql from "@/lib/db";

export interface MuradianAskAgentDocument {
  id: string;
  userId: string;
  name: string;
  description: string;
  systemInstruction: string;
  visibility?: MuradianAskAgentVisibility;
  createdAt: Date;
  updatedAt: Date;
}

export type MuradianAskAgentVisibility = "private" | "public";

export interface MuradianAskAgentPayload {
  name: string;
  description: string;
  systemInstruction: string;
  visibility: MuradianAskAgentVisibility;
}

export async function getMuradianAskAgents(
  userId: string,
): Promise<MuradianAskAgentDocument[]> {
  const rows = await sql`
    SELECT id, user_id AS "userId", name, description,
           system_instruction AS "systemInstruction",
           visibility, created_at AS "createdAt", updated_at AS "updatedAt"
    FROM muradian_ask_agents WHERE user_id = ${userId}
    ORDER BY updated_at DESC
  `;
  return rows as MuradianAskAgentDocument[];
}

export async function getMuradianAskAgentById(
  userId: string,
  agentId: string,
): Promise<MuradianAskAgentDocument | null> {
  const rows = await sql`
    SELECT id, user_id AS "userId", name, description,
           system_instruction AS "systemInstruction",
           visibility, created_at AS "createdAt", updated_at AS "updatedAt"
    FROM muradian_ask_agents WHERE id = ${agentId} AND user_id = ${userId}
  `;
  return (rows[0] as MuradianAskAgentDocument) ?? null;
}

export async function getMuradianAskAgentForUse(
  userId: string,
  agentId: string,
): Promise<MuradianAskAgentDocument | null> {
  const rows = await sql`
    SELECT id, user_id AS "userId", name, description,
           system_instruction AS "systemInstruction",
           visibility, created_at AS "createdAt", updated_at AS "updatedAt"
    FROM muradian_ask_agents
    WHERE id = ${agentId} AND (user_id = ${userId} OR visibility = 'public')
  `;
  return (rows[0] as MuradianAskAgentDocument) ?? null;
}

export async function searchPublicMuradianAskAgents(
  userId: string,
  query: string,
  limit = 12,
  offset = 0,
): Promise<{ agents: MuradianAskAgentDocument[]; total: number }> {
  const pattern = `%${query}%`;
  const [rows, countRows] = await Promise.all([
    sql`
      SELECT id, user_id AS "userId", name, description,
             system_instruction AS "systemInstruction",
             visibility, created_at AS "createdAt", updated_at AS "updatedAt"
      FROM muradian_ask_agents
      WHERE user_id != ${userId} AND visibility = 'public'
        AND (name ILIKE ${pattern} OR description ILIKE ${pattern})
      ORDER BY name ASC
      LIMIT ${limit} OFFSET ${offset}
    `,
    sql`
      SELECT COUNT(*)::int AS total FROM muradian_ask_agents
      WHERE user_id != ${userId} AND visibility = 'public'
        AND (name ILIKE ${pattern} OR description ILIKE ${pattern})
    `,
  ]);
  return {
    agents: rows as MuradianAskAgentDocument[],
    total: (countRows[0] as { total: number }).total,
  };
}

export async function listPublicMuradianAskAgents(
  userId: string,
  limit = 12,
  offset = 0,
): Promise<{ agents: MuradianAskAgentDocument[]; total: number }> {
  const [rows, countRows] = await Promise.all([
    sql`
      SELECT id, user_id AS "userId", name, description,
             system_instruction AS "systemInstruction",
             visibility, created_at AS "createdAt", updated_at AS "updatedAt"
      FROM muradian_ask_agents
      WHERE user_id != ${userId} AND visibility = 'public'
      ORDER BY name ASC
      LIMIT ${limit} OFFSET ${offset}
    `,
    sql`
      SELECT COUNT(*)::int AS total FROM muradian_ask_agents
      WHERE user_id != ${userId} AND visibility = 'public'
    `,
  ]);
  return {
    agents: rows as MuradianAskAgentDocument[],
    total: (countRows[0] as { total: number }).total,
  };
}

export async function getRandomPublicMuradianAskAgents(
  limit = 5,
): Promise<MuradianAskAgentDocument[]> {
  const rows = await sql`
    SELECT id, user_id AS "userId", name, description,
           system_instruction AS "systemInstruction",
           visibility, created_at AS "createdAt", updated_at AS "updatedAt"
    FROM muradian_ask_agents
    WHERE visibility = 'public'
    ORDER BY RANDOM()
    LIMIT ${limit}
  `;
  return rows as MuradianAskAgentDocument[];
}

export async function createMuradianAskAgent(
  userId: string,
  payload: MuradianAskAgentPayload,
): Promise<{ insertedId: string }> {
  const rows = await sql`
    INSERT INTO muradian_ask_agents
      (user_id, name, description, system_instruction, visibility, created_at, updated_at)
    VALUES
      (${userId}, ${payload.name}, ${payload.description},
       ${payload.systemInstruction}, ${payload.visibility}, NOW(), NOW())
    RETURNING id
  `;
  return { insertedId: (rows[0] as { id: string }).id };
}

export async function updateMuradianAskAgent(
  userId: string,
  agentId: string,
  payload: MuradianAskAgentPayload,
): Promise<{ matchedCount: number }> {
  const rows = await sql`
    UPDATE muradian_ask_agents SET
      name = ${payload.name},
      description = ${payload.description},
      system_instruction = ${payload.systemInstruction},
      visibility = ${payload.visibility},
      updated_at = NOW()
    WHERE id = ${agentId} AND user_id = ${userId}
    RETURNING id
  `;
  return { matchedCount: rows.length };
}

export async function deleteMuradianAskAgent(
  userId: string,
  agentId: string,
): Promise<{ deletedCount: number }> {
  const rows = await sql`
    DELETE FROM muradian_ask_agents
    WHERE id = ${agentId} AND user_id = ${userId}
    RETURNING id
  `;
  return { deletedCount: rows.length };
}
