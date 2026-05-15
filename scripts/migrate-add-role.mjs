import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

for (const envFile of [".env.local", ".env"]) {
  try {
    const content = readFileSync(resolve(__dirname, "..", envFile), "utf-8");
    for (const line of content.split("\n")) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match)
        process.env[match[1].trim()] = match[2]
          .trim()
          .replace(/^["']|["']$/g, "");
    }
    console.log(`Loaded ${envFile}`);
    break;
  } catch {
    // try next
  }
}

const { neon } = await import("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

// Drop old constraint if exists, add free/lite/plus constraint, set default to free
await sql`
  ALTER TABLE users
    DROP CONSTRAINT IF EXISTS users_role_check
`;
await sql`
  ALTER TABLE users
    ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'free'
`;
await sql`
  ALTER TABLE users
    ALTER COLUMN role SET DEFAULT 'free'
`;
await sql`
  ALTER TABLE users
    ADD CONSTRAINT users_role_check CHECK (role IN ('free', 'lite', 'plus'))
`;
// Reset anyone mistakenly set to 'lite' back to 'free' (from previous migration run)
await sql`
  UPDATE users SET role = 'free' WHERE role = 'lite'
`;

console.log(
  "Migration complete: users.role = free/lite/plus, default 'free', existing users reset to 'free'",
);
