# Lovern Martindale Author Site

Minimal Node.js author site for Lovern Martindale, designed for Heroku deployment with Neon Postgres.

## Features

- Public author home page
- Lead magnet landing page at `/bonus-pack`
- Signup form with attribution fields
- Neon/Postgres subscriber storage through `DATABASE_URL`
- Local JSON fallback for development when `DATABASE_URL` is not set
- Amazon SES double opt-in confirmation email
- Private S3 lead magnet delivery through signed URLs
- Scheduled campaign sender for Heroku Scheduler
- Simple admin status/export route

## Local Development

Install dependencies:

```powershell
npm install
```

Run locally:

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```

Without `DATABASE_URL`, signups are stored in `data/subscribers.json` for local form testing only. SES confirmation, campaign scheduling, and admin export require Neon/Postgres.

## Environment Variables

Copy `.env.example` to `.env` for local reference. Heroku config vars should include:

```text
BASE_URL=https://your-heroku-app.herokuapp.com
DATABASE_URL=postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require
FROM_EMAIL=Lovern Martindale <info@lovernmartindale.com>
ADMIN_TOKEN=change-me-long-random-token
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=lovern-martindale-bucket
BONUS_PACK_S3_KEY=meadow-lake-reader-bonus-pack.pdf
S3_SIGNED_URL_EXPIRES_SECONDS=3600
CONFIRMATION_TOKEN_DAYS=30
PGSSLMODE=require
```

SES and S3 are both configured for `us-east-2` per project requirements.

## Neon Database Setup

After setting `DATABASE_URL`, initialize the schema:

```powershell
npm run db:init
```

Heroku one-off command:

```bash
heroku run npm run db:init --app your-heroku-app
```

## Heroku Setup

```bash
heroku create your-heroku-app
heroku config:set BASE_URL=https://your-heroku-app.herokuapp.com
heroku config:set DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require"
heroku config:set PGSSLMODE=require
heroku config:set FROM_EMAIL="Lovern Martindale <info@lovernmartindale.com>"
heroku config:set ADMIN_TOKEN="long-random-token"
heroku config:set AWS_REGION=us-east-2
heroku config:set AWS_ACCESS_KEY_ID="..."
heroku config:set AWS_SECRET_ACCESS_KEY="..."
heroku config:set S3_BUCKET="lovern-martindale-bucket"
heroku config:set BONUS_PACK_S3_KEY="meadow-lake-reader-bonus-pack.pdf"
git push heroku main
heroku run npm run db:init
```

## Double Opt-In Flow

1. Reader submits `/bonus-pack`.
2. App stores subscriber in Neon as `pending_confirmation`.
3. App sends a confirmation email through Amazon SES.
4. Confirmation link is valid for 30 days.
5. `/confirm?token=...` marks the subscriber as `confirmed`.
6. The confirmation page shows a signed S3 download link for the private bonus pack file.

## S3 Delivery

The lead magnet file should be private in S3.

The app generates a short-lived signed URL on confirmation. Upload the file to:

```text
s3://YOUR_BUCKET/lead-magnets/meadow-lake-reader-bonus-pack.pdf
```

or change `BONUS_PACK_S3_KEY`.

## Scheduled Campaigns

The app supports delayed email sequences through:

- `campaigns`
- `campaign_steps`
- `subscriber_campaigns`
- `email_sends`

The send log uses a unique `send_key`, so if Heroku Scheduler runs twice, the same campaign step is not sent twice to the same subscriber.

Run manually:

```powershell
npm run send:scheduled
```

Heroku Scheduler:

```bash
heroku addons:create scheduler:standard
```

In the Heroku dashboard, add a daily job:

```text
npm run send:scheduled
```

Set it to run around 6:00 AM Central Time. Heroku Scheduler times are configured in the Heroku dashboard and shown in UTC, so adjust for Central Time when selecting the schedule.

## Admin

Set `ADMIN_TOKEN`, then visit:

```text
/admin?token=YOUR_ADMIN_TOKEN
```

CSV export:

```text
/admin/subscribers.csv?token=YOUR_ADMIN_TOKEN
```

## Attribution Links

Use source/campaign query params:

```text
/bonus-pack?source=instagram&campaign=instagram_bonuspack_signup_month01
/bonus-pack?source=tiktok&campaign=tiktok_bonuspack_signup_month01
/bonus-pack?source=facebook&campaign=facebook_bonuspack_signup_month01
/bonus-pack?source=pinterest&campaign=pinterest_bonuspack_signup_month01
```

## GitHub Remote

Repository:

```text
https://github.com/Nanobrainiac/lovern-martindale-author.git
```
