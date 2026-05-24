import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { requireDb, pool } from "../lib/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.dirname(__dirname);
const workspaceRoot = path.dirname(appRoot);
const calendarPath = path.join(workspaceRoot, "book-marketing-system", "calendar", "month-01-posting-schedule.md");

function splitRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

try {
  const db = requireDb();
  const markdown = await fs.readFile(calendarPath, "utf8");
  const rows = markdown
    .split(/\r?\n/)
    .filter((line) => line.startsWith("| ") && !line.includes("---"))
    .map(splitRow)
    .filter((cells) => /^\d+$/.test(cells[0]));

  for (const cells of rows) {
    await db.query(
      `INSERT INTO social_posts (
        campaign_month, day_number, platform, post_type, campaign_angle, cta,
        asset_required, audio_required, posting_time, attribution_campaign, status
      ) VALUES ('month-01', $1, $2, $3, $4, $5, $6, $7, $8, $9, 'planned')
      ON CONFLICT (campaign_month, day_number, platform, post_type, attribution_campaign)
      DO UPDATE SET
        campaign_angle = EXCLUDED.campaign_angle,
        cta = EXCLUDED.cta,
        asset_required = EXCLUDED.asset_required,
        audio_required = EXCLUDED.audio_required,
        posting_time = EXCLUDED.posting_time,
        updated_at = NOW()`,
      [Number(cells[0]), cells[1], cells[2], cells[3], cells[4], cells[5], cells[6], cells[7], cells[8]]
    );
  }

  console.log(`Seeded ${rows.length} social calendar posts.`);
} finally {
  await pool?.end();
}
