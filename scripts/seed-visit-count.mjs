import { readFileSync } from "fs";
import { createRequire } from "module";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const envPath = join(__dirname, "../.env");
const envLocal = join(__dirname, "../.env.local");

function loadEnv(path) {
  try {
    const lines = readFileSync(path, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // file may not exist
  }
}

loadEnv(envLocal);
loadEnv(envPath);

const require = createRequire(import.meta.url);
const { neon } = require("@neondatabase/serverless");

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

const SITE_KEY = "site-homepage";
const SEED_COUNT = 3000;

async function seedVisitCount() {
  const result = await sql`
    INSERT INTO visit_counts (key, tab_id, title, url, source, count, created_at, updated_at)
    VALUES (${SITE_KEY}, ${SITE_KEY}, null, null, 'seed', ${SEED_COUNT}, NOW(), NOW())
    ON CONFLICT (key) DO UPDATE SET
      count = ${SEED_COUNT},
      updated_at = NOW()
    RETURNING key, count
  `;

  console.log(`visit_counts set: key="${result[0].key}", count=${result[0].count}`);
}

seedVisitCount().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
