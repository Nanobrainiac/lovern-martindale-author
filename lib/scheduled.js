import { getBonusPackUrl } from "./downloads.js";
import { sendEmail } from "./email.js";
import { requireDb } from "./db.js";
import { marketingEmail } from "./templates.js";
import { config } from "./config.js";

export async function sendScheduledEmails({ limit = 100 } = {}) {
  const db = requireDb();
  const due = await db.query(
    `SELECT
      sc.id AS subscriber_campaign_id,
      s.id AS subscriber_id,
      s.first_name,
      s.email,
      c.id AS campaign_id,
      c.slug AS campaign_slug,
      cs.id AS campaign_step_id,
      cs.step_key,
      cs.subject,
      cs.body_html
    FROM subscriber_campaigns sc
    JOIN subscribers s ON s.id = sc.subscriber_id
    JOIN campaigns c ON c.id = sc.campaign_id
    JOIN campaign_steps cs ON cs.campaign_id = c.id
    WHERE sc.active = TRUE
      AND c.active = TRUE
      AND cs.active = TRUE
      AND s.status = 'confirmed'
      AND s.unsubscribed_at IS NULL
      AND sc.started_at + (cs.delay_days || ' days')::INTERVAL <= NOW()
      AND NOT EXISTS (
        SELECT 1
        FROM email_sends es
        WHERE es.send_key = c.slug || ':' || cs.step_key || ':' || s.id
      )
    ORDER BY sc.started_at ASC, cs.delay_days ASC
    LIMIT $1`,
    [limit]
  );

  let sent = 0;
  let skipped = 0;
  const downloadUrl = await getBonusPackUrl();

  for (const row of due.rows) {
    const sendKey = `${row.campaign_slug}:${row.step_key}:${row.subscriber_id}`;
    const unsubscribeUrl = `${config.baseUrl}/unsubscribe?email=${encodeURIComponent(row.email)}`;

    const inserted = await db.query(
      `INSERT INTO email_sends (
        subscriber_id, campaign_id, campaign_step_id, send_key, email_type, to_email, subject, status
      ) VALUES ($1, $2, $3, $4, 'campaign', $5, $6, 'sending')
      ON CONFLICT (send_key) DO NOTHING
      RETURNING id`,
      [row.subscriber_id, row.campaign_id, row.campaign_step_id, sendKey, row.email, row.subject]
    );

    if (!inserted.rowCount) {
      skipped += 1;
      continue;
    }

    try {
      const html = marketingEmail({
        firstName: row.first_name,
        bodyHtml: row.body_html,
        unsubscribeUrl,
        downloadUrl,
      });
      const result = await sendEmail({ to: row.email, subject: row.subject, html });
      await db.query(
        `UPDATE email_sends SET status = 'sent', provider_message_id = $1, sent_at = NOW() WHERE id = $2`,
        [result.MessageId || null, inserted.rows[0].id]
      );
      sent += 1;
    } catch (error) {
      await db.query(`UPDATE email_sends SET status = 'failed', error = $1 WHERE id = $2`, [
        String(error?.message || error),
        inserted.rows[0].id,
      ]);
      throw error;
    }
  }

  return { sent, skipped, checked: due.rowCount };
}
