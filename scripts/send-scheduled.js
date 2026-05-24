import { sendScheduledEmails } from "../lib/scheduled.js";
import { pool } from "../lib/db.js";

try {
  const result = await sendScheduledEmails();
  console.log(`Scheduled email run complete: checked=${result.checked}, sent=${result.sent}, skipped=${result.skipped}`);
} finally {
  if (pool) {
    await pool.end();
  }
}

