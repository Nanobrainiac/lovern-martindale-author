import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { requireDb, pool } from "../lib/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.dirname(__dirname);
const workspaceRoot = path.dirname(appRoot);

const files = [
  ["Facebook", "book-marketing-system/content/facebook/month-01-posts.md"],
  ["Instagram", "book-marketing-system/content/instagram/month-01-posts.md"],
  ["TikTok", "book-marketing-system/content/tiktok/month-01-scripts.md"],
  ["Pinterest", "book-marketing-system/content/pinterest/month-01-pins.md"],
  ["Goodreads", "book-marketing-system/content/goodreads/month-01-updates.md"],
  ["BookBub", "book-marketing-system/content/bookbub/month-01-copy.md"],
];

function sections(markdown) {
  const matches = [...markdown.matchAll(/^## Day (\d+)[^\n]*\n([\s\S]*?)(?=^## Day \d+|\Z)/gm)];
  return matches.map((match) => ({
    day: Number(match[1]),
    text: match[2].trim(),
  }));
}

try {
  const db = requireDb();
  let updated = 0;

  for (const [platform, relativePath] of files) {
    const markdown = await fs.readFile(path.join(workspaceRoot, relativePath), "utf8");
    for (const section of sections(markdown)) {
      const result = await db.query(
        `UPDATE social_posts
         SET post_text = $1, updated_at = NOW()
         WHERE campaign_month = 'month-01'
           AND day_number = $2
           AND platform = $3`,
        [section.text, section.day, platform]
      );
      updated += result.rowCount;
    }
  }

  console.log(`Updated ${updated} social calendar content rows.`);
} finally {
  await pool?.end();
}
