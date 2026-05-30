# Lovern Martindale Author Site

Minimal Node.js author site for Lovern Martindale, designed for Heroku deployment with Neon Postgres.

## Features

- Public author home page
- Lead magnet landing page at `/bonus-pack`
- Review links page at `/reviews`
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

Copy `.env.example` to `.env` for local reference. Heroku config vars should include the following names. Do not commit real values.

```text
BASE_URL=https://your-heroku-app.herokuapp.com
DATABASE_URL=<neon-postgres-connection-string>
FROM_EMAIL=<verified-ses-from-email>
ADMIN_TOKEN=<long-random-token>
AWS_REGION=<aws-region>
AWS_ACCESS_KEY_ID=<aws-access-key-id>
AWS_SECRET_ACCESS_KEY=<aws-secret-access-key>
S3_BUCKET=<private-s3-bucket-name>
BONUS_PACK_S3_KEY=meadow-lake-reader-bonus-pack-v3-compressed.pdf
S3_SIGNED_URL_EXPIRES_SECONDS=3600
CONFIRMATION_TOKEN_DAYS=30
PGSSLMODE=require
```

SES and S3 must use the same region configured in Heroku.

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

Create the Heroku app, add the config vars listed above in the Heroku dashboard, connect the GitHub repo, and deploy the `main` branch.

After the first deploy, initialize the database with a Heroku one-off command:

```bash
heroku run npm run db:init --app your-heroku-app
```

Apply or update the evergreen campaign emails:

```bash
heroku run npm run db:seed-campaigns --app your-heroku-app
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

The app generates a short-lived signed URL on confirmation. Upload the file to the private bucket and set `S3_BUCKET` plus `BONUS_PACK_S3_KEY` to match that object.

```text
s3://<private-s3-bucket-name>/<bonus-pack-object-key>
```

Do not commit the real bucket name if the repository is public.

## Scheduled Campaigns

The app supports delayed email sequences through:

- `campaigns`
- `campaign_steps`
- `subscriber_campaigns`
- `email_sends`

The send log uses a unique `send_key`, so if Heroku Scheduler runs twice, the same campaign step is not sent twice to the same subscriber.

The default `welcome` campaign is a 19-email evergreen welcome and nurture sequence:

- Day 0: welcome and bonus pack reminder
- Day 2: Book 1 emotional hook
- Day 4: Meadow Lake world/setting note
- Day 7: Book 2 bridge
- Day 14: review/reader relationship note
- Day 21: Book 3/read-through bridge
- Day 35: Meadow Lake setting/home note
- Day 49: healing romance reader fit
- Day 63: Book 1 coffee hook reminder
- Day 77: Book 2 gentle read-through nudge
- Day 91: reader preference/question note
- Day 105: review/shelf-add reminder
- Day 119: Book 3 courage/read-through nudge
- Day 133: family and found-family theme note
- Day 147: bonus pack reminder/referral prompt
- Day 161: reader preference reply prompt
- Day 175: TBR/reactivation reminder
- Day 189: full series reading path
- Day 203: thank-you and review/follow close

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
