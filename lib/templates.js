import { config } from "./config.js";

export function confirmationEmail({ firstName, confirmUrl, unsubscribeUrl }) {
  const escapedName = escapeHtml(firstName);
  return {
    subject: "Confirm your Meadow Lake bonus pack",
    html: `<p>Hi ${escapedName},</p>
      <p>Thank you for requesting the Meadow Lake Reader Bonus Pack.</p>
      <p>Please confirm your email address below. Once you confirm, you will land on the download page for your bonus pack.</p>
      <p><a href="${confirmUrl}">Confirm my email and open the bonus pack</a></p>
      <p>If you did not request this, you can ignore this email.</p>
      <p>You can unsubscribe anytime: <a href="${unsubscribeUrl}">unsubscribe</a>.</p>
      <p>Warmly,<br>Lovern Martindale</p>`,
  };
}

export function marketingEmail({ firstName, bodyHtml, unsubscribeUrl, downloadUrl }) {
  return String(bodyHtml)
    .replaceAll("{{first_name}}", escapeHtml(firstName))
    .replaceAll("{{unsubscribe_url}}", unsubscribeUrl)
    .replaceAll("{{bonus_pack_url}}", downloadUrl || `${config.baseUrl}/bonus-pack`);
}

export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

