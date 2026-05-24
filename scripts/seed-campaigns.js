import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { requireDb, pool } from "../lib/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(__dirname);

try {
  const db = requireDb();
  const seedSql = await fs.readFile(path.join(root, "sql", "seed-welcome-campaign.sql"), "utf8");
  await db.query(seedSql);
  console.log("Campaign seeds applied.");
} finally {
  await pool?.end();
}
