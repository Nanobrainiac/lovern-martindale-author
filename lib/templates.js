import { config } from "./config.js";

export function confirmationEmail({ firstName, confirmUrl, unsubscribeUrl }) {
  const escapedName = escapeHtml(firstName);
  return {
    subject: "Confirm your Meadow Lake bonus pack",
    html: emailShell({
      eyebrow: "Meadow Lake Reader Bonus Pack",
      title: "Confirm your email",
      bodyHtml: `<p>Hi ${escapedName},</p>
      <p>Thank you for requesting the Meadow Lake Reader Bonus Pack.</p>
      <p>Please confirm your email address below. Once you confirm, you will land on the download page for your bonus pack.</p>
      <p><a class="button" href="${confirmUrl}">Confirm my email and open the bonus pack</a></p>
      <p>If you did not request this, you can ignore this email.</p>
      <p>You can unsubscribe anytime: <a href="${unsubscribeUrl}">unsubscribe</a>.</p>
      <p>Warmly,<br>Lovern Martindale</p>`,
    }),
  };
}

export function marketingEmail({ firstName, bodyHtml, unsubscribeUrl, downloadUrl }) {
  const rendered = String(bodyHtml)
    .replaceAll("{{first_name}}", escapeHtml(firstName))
    .replaceAll("{{unsubscribe_url}}", unsubscribeUrl)
    .replaceAll("{{bonus_pack_url}}", downloadUrl || `${config.baseUrl}/bonus-pack`);

  return emailShell({
    eyebrow: "From Meadow Lake",
    title: "A note from Lovern Martindale",
    bodyHtml: rendered,
  });
}

function emailShell({ eyebrow, title, bodyHtml }) {
  return `<!doctype html>
<html>
<body style="margin:0;background:#fbf4ec;color:#3f2224;font-family:Georgia,'Times New Roman',serif;">
  <div style="display:none;max-height:0;overflow:hidden;color:transparent;">${escapeHtml(eyebrow)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fbf4ec;padding:28px 14px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#fffaf4;border:1px solid #eadbd0;border-radius:14px;overflow:hidden;">
          <tr>
            <td style="padding:28px 30px 18px;text-align:center;background:#fff7ef;border-bottom:1px solid #eadbd0;">
              <div style="font-family:Arial,sans-serif;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#a93862;">${escapeHtml(eyebrow)}</div>
              <div style="margin-top:10px;font-size:30px;line-height:1.1;font-weight:700;color:#3f2224;">${escapeHtml(title)}</div>
              <div style="width:62px;height:3px;background:#df4f83;margin:18px auto 0;border-radius:999px;"></div>
            </td>
          </tr>
          <tr>
            <td class="email-body" style="padding:30px;font-size:17px;line-height:1.65;color:#3f2224;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 30px;background:#fff7ef;border-top:1px solid #eadbd0;text-align:center;font-family:Arial,sans-serif;font-size:13px;line-height:1.5;color:#735b57;">
              Emotional small-town romance for readers who believe healing can still find its way home.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <style>
    .email-body p { margin: 0 0 17px; }
    .email-body a { color: #187a84; font-weight: 700; }
    .email-body .button {
      background: #df4f83;
      border-radius: 8px;
      color: #ffffff !important;
      display: inline-block;
      font-family: Arial, sans-serif;
      font-weight: 800;
      padding: 13px 18px;
      text-decoration: none;
    }
  </style>
</body>
</html>`;
}

export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
