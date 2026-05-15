import sql from "@/lib/db";
import type { ShareProfileTab, ShareProfileSettings } from "@/lib/shareProfile";
import type { UserData } from "./db";

export async function pushUserData(
  userId: string,
  data: { tabs: ShareProfileTab[]; settings: ShareProfileSettings | null },
): Promise<void> {
  if (data.settings === null) {
    // tabs-only: preserve existing settings in DB
    await sql`
      INSERT INTO user_data (user_id, tabs, settings, updated_at)
      VALUES (${userId}, ${JSON.stringify(data.tabs)}, '{}'::jsonb, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        tabs = ${JSON.stringify(data.tabs)},
        updated_at = NOW()
    `;
  } else {
    await sql`
      INSERT INTO user_data (user_id, tabs, settings, updated_at)
      VALUES (${userId}, ${JSON.stringify(data.tabs)}, ${JSON.stringify(data.settings)}, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        tabs = ${JSON.stringify(data.tabs)},
        settings = ${JSON.stringify(data.settings)},
        updated_at = NOW()
    `;
  }
}

export async function pullUserData(userId: string): Promise<UserData | null> {
  const rows = await sql`
    SELECT user_id AS "userId", tabs, settings, updated_at AS "updatedAt"
    FROM user_data WHERE user_id = ${userId}
  `;
  if (!rows[0]) return null;
  const row = rows[0] as {
    userId: string;
    tabs: unknown;
    settings: unknown;
    updatedAt: Date;
  };
  return {
    userId: row.userId,
    tabs: row.tabs as ShareProfileTab[],
    settings: row.settings as ShareProfileSettings,
    updatedAt: row.updatedAt,
  };
}
