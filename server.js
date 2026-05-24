import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./lib/config.js";
import { pool } from "./lib/db.js";
import { getBonusPackUrl } from "./lib/downloads.js";
import { sendEmail } from "./lib/email.js";
import { hashIp, hashToken, newToken } from "./lib/security.js";
import { confirmationEmail } from "./lib/templates.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATIC_DIR = path.join(__dirname, "public");
const LOCAL_SUBSCRIBERS = path.join(__dirname, "data", "subscribers.json");
const LOCAL_DOWNLOAD_PATH = "/downloads/meadow-lake-reader-bonus-pack.html";

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function send(res, status, body, type = "text/html; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function redirect(res, location) {
  res.writeHead(303, { Location: location });
  res.end();
}

function parseCookies(cookieHeader = "") {
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((pair) => pair.trim().split("="))
      .filter(([key]) => key)
      .map(([key, ...rest]) => [key, decodeURIComponent(rest.join("="))])
  );
}

function isAdmin(req) {
  if (!config.adminToken) return false;
  const url = new URL(req.url || "/", config.baseUrl);
  const auth = req.headers.authorization || "";
  return url.searchParams.get("token") === config.adminToken || auth === `Bearer ${config.adminToken}`;
}

function parseMulti(params, name) {
  const values = params.getAll(name).filter(Boolean);
  return values.length ? values : [];
}

function normalizeSource(value) {
  const source = String(value || "").trim().toLowerCase();
  const allowed = ["instagram", "tiktok", "facebook", "pinterest", "goodreads", "bookbub", "newsletter", "direct"];
  return allowed.includes(source) ? source : "direct";
}

function pageShell({ title, description, body, extraClass = "" }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="stylesheet" href="/styles.css">
</head>
<body class="${extraClass}">
  ${body}
</body>
</html>`;
}

function nav() {
  return `<header class="site-header">
    <a class="brand" href="/" aria-label="Lovern Martindale home">
      <img src="/assets/lovern-martindale-script-logo-02.png" alt="Lovern Martindale" style="width: 200px; height: auto;">
    </a>
    <nav>
      <a href="/#books">Books</a>
      <a href="/bonus-pack">Bonus Pack</a>
      <a href="/#author">Author</a>
    </nav>
  </header>`;
}

function homePage() {
  return pageShell({
    title: "Lovern Martindale | Meadow Lake Romance",
    description: "Emotional small-town romance by Lovern Martindale.",
    body: `${nav()}
    <main>
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">Meadow Lake Romance</p>
          <h1>Emotional small-town romance for hearts that still believe in healing.</h1>
          <p class="lede">Step into Meadow Lake, where coffee shop beginnings, family bonds, and second chances slowly become home.</p>
          <div class="button-row">
            <a class="button primary" href="/bonus-pack">Get the free bonus pack</a>
            <a class="button secondary" href="https://www.amazon.com/author/lovern-martindale">Start reading</a>
          </div>
        </div>
        <img class="hero-image" src="/assets/series-paperback-mockup.png" alt="Meadow Lake series book mockups">
      </section>

      <section class="band" id="books">
        <div class="section-heading">
          <p class="eyebrow">Start the series</p>
          <h2>When Bruised Hearts Collide</h2>
          <p>One forgotten coffee. Two bruised hearts. A small town where healing arrives softly.</p>
        </div>
        <div class="book-grid">
          <img src="/assets/book-01-kindle-mockup.png" alt="When Bruised Hearts Collide Kindle mockup">
          <div>
            <h3>For readers who love</h3>
            <ul class="check-list">
              <li>Emotional small-town romance</li>
              <li>Coffee shop beginnings</li>
              <li>Healing after heartbreak</li>
              <li>Family bonds and found family</li>
              <li>Kindle Unlimited reads</li>
            </ul>
            <a class="button primary" href="https://www.amazon.com/author/lovern-martindale">Visit Amazon author page</a>
          </div>
        </div>
      </section>

      <section class="author-strip" id="author">
        <img src="/assets/author-profile.jpeg" alt="Lovern Martindale author photo">
        <div>
          <p class="eyebrow">The author</p>
          <h2>Lovern Martindale</h2>
          <p>Lovern writes warm, heartfelt romance centered on grief, family, coffee, home, and the kind of love that gives wounded hearts room to heal.</p>
        </div>
      </section>
    </main>
    ${footer()}`,
  });
}

function bonusPackPage(query = {}) {
  const source = escapeHtml(normalizeSource(query.source));
  const campaign = escapeHtml(query.campaign || `${source}_bonuspack_signup_month01`);
  return pageShell({
    title: "Free Meadow Lake Reader Bonus Pack",
    description: "Get the free Meadow Lake reader bonus pack from Lovern Martindale.",
    extraClass: "bonus-page",
    body: `${nav()}
    <main>
      <section class="signup-hero">
        <div class="signup-copy">
          <p class="eyebrow">Free reader bonus</p>
          <h1>Free Meadow Lake Reader Bonus Pack</h1>
          <p class="lede">For readers who love emotional small-town romance, coffee shop beginnings, family bonds, wounded hearts, and second chances that heal slowly.</p>
          <ul class="check-list compact">
            <li>Meadow Lake series reading guide</li>
            <li>Spoiler-safe character introductions</li>
            <li>Printable quote cards and cozy romance extras</li>
          </ul>
        </div>
        <div class="signup-card" id="signup">
          <h2>Send me the bonus pack</h2>
          <p>Tell me where to send your free Meadow Lake extras.</p>
          <form action="/api/signup" method="post">
            <input type="hidden" name="source_platform" value="${source}">
            <input type="hidden" name="campaign" value="${campaign}">
            <label>
              First name
              <input name="first_name" autocomplete="given-name" required maxlength="80">
            </label>
            <label>
              Email address
              <input type="email" name="email" autocomplete="email" required maxlength="160">
            </label>
            <fieldset>
              <legend>Favorite reading format</legend>
              <label class="option"><input type="checkbox" name="format_interest" value="Kindle"> Kindle</label>
              <label class="option"><input type="checkbox" name="format_interest" value="Kindle Unlimited"> Kindle Unlimited</label>
              <label class="option"><input type="checkbox" name="format_interest" value="Paperback"> Paperback</label>
            </fieldset>
            <fieldset>
              <legend>Favorite romance notes</legend>
              <label class="option"><input type="checkbox" name="trope_interest" value="Small-town romance"> Small-town romance</label>
              <label class="option"><input type="checkbox" name="trope_interest" value="Healing after heartbreak"> Healing after heartbreak</label>
              <label class="option"><input type="checkbox" name="trope_interest" value="Found family"> Found family</label>
              <label class="option"><input type="checkbox" name="trope_interest" value="Love after loss"> Love after loss</label>
            </fieldset>
            <label class="consent">
              <input type="checkbox" name="consent" value="yes" required>
              <span>Yes, send me the free Meadow Lake reader bonus pack and occasional book news from Lovern Martindale. I can unsubscribe anytime.</span>
            </label>
            <button class="button primary full" type="submit">Send Me The Bonus Pack</button>
          </form>
        </div>
      </section>

      <section class="band soft">
        <div class="section-heading">
          <p class="eyebrow">Inside the pack</p>
          <h2>A soft welcome into Meadow Lake</h2>
          <p>Made for readers who want romance that feels like porch-swing quiet, family dinners, coffee shop beginnings, and hearts learning how to feel safe again.</p>
        </div>
        <div class="feature-grid">
          <article><h3>Reading Guide</h3><p>A spoiler-safe guide to the Meadow Lake series and emotional world.</p></article>
          <article><h3>Character Cards</h3><p>A gentle introduction to the hearts and families readers will meet.</p></article>
          <article><h3>Quote Cards</h3><p>Printable romance extras for readers who love saving soft lines.</p></article>
        </div>
      </section>
    </main>
    ${footer()}`,
  });
}

function thankYouPage(firstName = "") {
  const name = firstName ? `, ${escapeHtml(firstName)}` : "";
  return pageShell({
    title: "Welcome to Meadow Lake",
    description: "Your Meadow Lake reader bonus pack is on its way.",
    body: `${nav()}
    <main>
      <section class="center-panel">
        <p class="eyebrow">You're in</p>
        <h1>Welcome to Meadow Lake${name}.</h1>
          <p>Your confirmation email is on its way. Click the link in that email to confirm your address and open the bonus pack.</p>
          <p>If it does not show up soon, check your spam or promotions folder.</p>
      </section>
    </main>
    ${footer()}`,
  });
}

function footer() {
  return `<footer class="site-footer">
    <p>Lovern Martindale</p>
    <p>Emotional small-town romance for readers who believe healing can still find its way home.</p>
    <small>&copy; 2026 Lovern Martindale. All rights reserved.</small>
  </footer>`;
}

async function saveSubscriber(subscriber) {
  if (pool) {
    const result = await pool.query(
      `INSERT INTO subscribers (
        first_name, email, consent, source_platform, campaign, lead_magnet,
        format_interest, trope_interest, status, confirmation_token_hash,
        confirmation_sent_at, confirmation_expires_at, user_agent, ip_hash, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending_confirmation', $9, NOW(), NOW() + ($10 || ' days')::INTERVAL, $11, $12, NOW())
      ON CONFLICT (email) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        consent = EXCLUDED.consent,
        status = CASE
          WHEN subscribers.status = 'confirmed' THEN subscribers.status
          ELSE 'pending_confirmation'
        END,
        source_platform = EXCLUDED.source_platform,
        campaign = EXCLUDED.campaign,
        format_interest = EXCLUDED.format_interest,
        trope_interest = EXCLUDED.trope_interest,
        confirmation_token_hash = CASE
          WHEN subscribers.status = 'confirmed' THEN subscribers.confirmation_token_hash
          ELSE EXCLUDED.confirmation_token_hash
        END,
        confirmation_sent_at = NOW(),
        confirmation_expires_at = CASE
          WHEN subscribers.status = 'confirmed' THEN subscribers.confirmation_expires_at
          ELSE EXCLUDED.confirmation_expires_at
        END,
        user_agent = EXCLUDED.user_agent,
        ip_hash = EXCLUDED.ip_hash,
        updated_at = NOW()
      RETURNING id, status`,
      [
        subscriber.firstName,
        subscriber.email,
        subscriber.consent,
        subscriber.sourcePlatform,
        subscriber.campaign,
        "meadow_lake_reader_bonus_pack",
        subscriber.formatInterest,
        subscriber.tropeInterest,
        subscriber.confirmationTokenHash,
        config.confirmationDays,
        subscriber.userAgent,
        subscriber.ipHash,
      ]
    );
    return result.rows[0];
  }

  await fs.mkdir(path.dirname(LOCAL_SUBSCRIBERS), { recursive: true });
  let current = [];
  try {
    current = JSON.parse(await fs.readFile(LOCAL_SUBSCRIBERS, "utf8"));
  } catch {
    current = [];
  }
  const withoutEmail = current.filter((item) => item.email !== subscriber.email);
  withoutEmail.push({ ...subscriber, createdAt: new Date().toISOString() });
  await fs.writeFile(LOCAL_SUBSCRIBERS, JSON.stringify(withoutEmail, null, 2));
  return { id: null, status: "pending_confirmation" };
}

async function sendConfirmation(subscriber) {
  const confirmUrl = `${config.baseUrl}/confirm?token=${encodeURIComponent(subscriber.confirmationToken)}`;
  const unsubscribeUrl = `${config.baseUrl}/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;
  const email = confirmationEmail({ firstName: subscriber.firstName, confirmUrl, unsubscribeUrl });
  const result = await sendEmail({ to: subscriber.email, subject: email.subject, html: email.html });

  if (pool && subscriber.dbId) {
    await pool.query(
      `INSERT INTO email_sends (subscriber_id, send_key, email_type, to_email, subject, status, provider_message_id)
       VALUES ($1, $2, 'confirmation', $3, $4, 'sent', $5)
       ON CONFLICT (send_key) DO NOTHING`,
      [subscriber.dbId, `confirmation:${subscriber.dbId}:${subscriber.confirmationTokenHash}`, subscriber.email, email.subject, result.MessageId || null]
    );
  }
}

async function handleSignup(req, res) {
  const body = await readBody(req);
  const params = new URLSearchParams(body);
  const firstName = String(params.get("first_name") || "").trim();
  const email = String(params.get("email") || "").trim().toLowerCase();
  const consent = params.get("consent") === "yes";

  if (!firstName || !email || !email.includes("@") || !consent) {
    send(res, 400, pageShell({
      title: "Signup needs one more detail",
      description: "Please complete the required signup fields.",
      body: `${nav()}<main><section class="center-panel"><h1>One more detail</h1><p>Please include your first name, a valid email, and consent before submitting.</p><a class="button primary" href="/bonus-pack">Return to signup</a></section></main>${footer()}`,
    }));
    return;
  }

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
  const subscriber = {
    firstName,
    email,
    consent,
    sourcePlatform: normalizeSource(params.get("source_platform")),
    campaign: String(params.get("campaign") || "").trim() || "direct_bonuspack_signup_month01",
    formatInterest: parseMulti(params, "format_interest"),
    tropeInterest: parseMulti(params, "trope_interest"),
    userAgent: req.headers["user-agent"] || "",
    ipHash: hashIp(ip),
    confirmationToken: newToken(),
  };
  subscriber.confirmationTokenHash = hashToken(subscriber.confirmationToken);

  const saved = await saveSubscriber(subscriber);
  subscriber.dbId = saved?.id;

  if (!pool) {
    console.log("DATABASE_URL missing; local signup saved but SES confirmation requires production database.");
  } else {
    await sendConfirmation(subscriber);
  }

  res.writeHead(303, {
    Location: `/thank-you?name=${encodeURIComponent(firstName)}`,
    "Set-Cookie": `subscriber=${encodeURIComponent(email)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000`,
  });
  res.end();
}

async function handleConfirm(req, res, token) {
  if (!pool) {
    send(res, 500, "DATABASE_URL is required for confirmation.", "text/plain; charset=utf-8");
    return;
  }

  const tokenHash = hashToken(token || "");
  const result = await pool.query(
    `UPDATE subscribers
     SET status = 'confirmed', confirmed_at = COALESCE(confirmed_at, NOW()), updated_at = NOW()
     WHERE confirmation_token_hash = $1
       AND confirmation_expires_at > NOW()
       AND unsubscribed_at IS NULL
     RETURNING id, first_name, email`,
    [tokenHash]
  );

  if (!result.rowCount) {
    send(res, 400, pageShell({
      title: "Confirmation link expired",
      description: "The confirmation link is invalid or expired.",
      body: `${nav()}<main><section class="center-panel"><h1>This link is not working.</h1><p>Your confirmation link may have expired. Please request the bonus pack again.</p><a class="button primary" href="/bonus-pack">Request a new link</a></section></main>${footer()}`,
    }));
    return;
  }

  await startDefaultCampaign(result.rows[0].id);
  const downloadUrl = await getBonusPackUrl();
  send(res, 200, confirmedPage(result.rows[0].first_name, downloadUrl));
}

async function startDefaultCampaign(subscriberId) {
  if (!pool) return;
  const campaign = await pool.query(`SELECT id FROM campaigns WHERE slug = 'welcome' AND active = TRUE LIMIT 1`);
  if (!campaign.rowCount) return;
  await pool.query(
    `INSERT INTO subscriber_campaigns (subscriber_id, campaign_id)
     VALUES ($1, $2)
     ON CONFLICT (subscriber_id, campaign_id) DO NOTHING`,
    [subscriberId, campaign.rows[0].id]
  );
}

function confirmedPage(firstName, downloadUrl) {
  const link = downloadUrl || LOCAL_DOWNLOAD_PATH;
  return pageShell({
    title: "Your Meadow Lake bonus pack",
    description: "Download your Meadow Lake reader bonus pack.",
    body: `${nav()}<main><section class="center-panel">
      <p class="eyebrow">Confirmed</p>
      <h1>Your bonus pack is ready, ${escapeHtml(firstName)}.</h1>
      <p>Thank you for confirming your email. Your download link is below.</p>
      <div class="button-row centered">
        <a class="button primary" href="${link}">Download the bonus pack</a>
        <a class="button secondary" href="https://www.amazon.com/author/lovern-martindale">Start the series</a>
      </div>
      <p>This download link may expire. If that happens, revisit your confirmation link or request the pack again.</p>
    </section></main>${footer()}`,
  });
}

async function handleUnsubscribe(req, res, email) {
  if (pool && email) {
    await pool.query(
      `UPDATE subscribers SET status = 'unsubscribed', unsubscribed_at = NOW(), updated_at = NOW() WHERE email = $1`,
      [String(email).trim().toLowerCase()]
    );
  }
  send(res, 200, pageShell({
    title: "Unsubscribed",
    description: "You have been unsubscribed.",
    body: `${nav()}<main><section class="center-panel"><h1>You are unsubscribed.</h1><p>You will not receive future Meadow Lake marketing emails at this address.</p></section></main>${footer()}`,
  }));
}

async function adminPage(req, res) {
  if (!isAdmin(req)) {
    send(res, 401, "Unauthorized", "text/plain; charset=utf-8");
    return;
  }
  if (!pool) {
    send(res, 500, "DATABASE_URL is required for admin.", "text/plain; charset=utf-8");
    return;
  }
  const stats = await pool.query(
    `SELECT status, COUNT(*)::int AS count FROM subscribers GROUP BY status ORDER BY status`
  );
  const rows = stats.rows.map((row) => `<tr><td>${escapeHtml(row.status)}</td><td>${row.count}</td></tr>`).join("");
  send(res, 200, pageShell({
    title: "Admin",
    description: "Subscriber admin",
    body: `${nav()}<main><section class="center-panel"><h1>Subscriber Admin</h1><table class="admin-table"><tbody>${rows}</tbody></table><p><a class="button primary" href="/admin/subscribers.csv?token=${encodeURIComponent(config.adminToken)}">Download CSV</a></p></section></main>${footer()}`,
  }));
}

async function adminCsv(req, res) {
  if (!isAdmin(req)) {
    send(res, 401, "Unauthorized", "text/plain; charset=utf-8");
    return;
  }
  const result = await pool.query(
    `SELECT first_name, email, status, source_platform, campaign, confirmed_at, unsubscribed_at, created_at
     FROM subscribers
     ORDER BY created_at DESC`
  );
  const csv = [
    "first_name,email,status,source_platform,campaign,confirmed_at,unsubscribed_at,created_at",
    ...result.rows.map((r) =>
      [r.first_name, r.email, r.status, r.source_platform, r.campaign, r.confirmed_at, r.unsubscribed_at, r.created_at]
        .map(csvCell)
        .join(",")
    ),
  ].join("\n");
  send(res, 200, csv, "text/csv; charset=utf-8");
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 20_000) {
        req.destroy();
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function serveStatic(req, res, pathname) {
  const decoded = decodeURIComponent(pathname);
  const filePath = path.normalize(path.join(STATIC_DIR, decoded));
  if (!filePath.startsWith(STATIC_DIR)) {
    send(res, 403, "Forbidden", "text/plain; charset=utf-8");
    return;
  }

  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": "public, max-age=3600",
    });
    res.end(data);
  } catch {
    send(res, 404, "Not found", "text/plain; charset=utf-8");
  }
}

async function router(req, res) {
  try {
    const url = new URL(req.url || "/", config.baseUrl);
    const pathname = url.pathname;

    if (req.method === "GET" && pathname === "/") {
      send(res, 200, homePage());
      return;
    }
    if (req.method === "GET" && pathname === "/bonus-pack") {
      send(res, 200, bonusPackPage(Object.fromEntries(url.searchParams.entries())));
      return;
    }
    if (req.method === "GET" && pathname === "/thank-you") {
      send(res, 200, thankYouPage(url.searchParams.get("name") || ""));
      return;
    }
    if (req.method === "GET" && pathname === "/confirm") {
      await handleConfirm(req, res, url.searchParams.get("token"));
      return;
    }
    if (req.method === "GET" && pathname === "/unsubscribe") {
      await handleUnsubscribe(req, res, url.searchParams.get("email"));
      return;
    }
    if (req.method === "GET" && pathname === "/admin") {
      await adminPage(req, res);
      return;
    }
    if (req.method === "GET" && pathname === "/admin/subscribers.csv") {
      await adminCsv(req, res);
      return;
    }
    if (req.method === "POST" && pathname === "/api/signup") {
      await handleSignup(req, res);
      return;
    }
    if (req.method === "GET" && pathname === "/styles.css") {
      await serveStatic(req, res, pathname);
      return;
    }
    if (req.method === "GET" && pathname.startsWith("/assets/")) {
      await serveStatic(req, res, pathname);
      return;
    }
    if (req.method === "GET" && pathname.startsWith("/downloads/")) {
      await serveStatic(req, res, pathname);
      return;
    }

    redirect(res, "/");
  } catch (error) {
    console.error(error);
    send(res, 500, "Something went wrong.", "text/plain; charset=utf-8");
  }
}

http.createServer(router).listen(config.port, () => {
  console.log(`Lovern Martindale author site running on ${config.baseUrl}`);
});
