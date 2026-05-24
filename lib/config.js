import "./load-env.js";

export const config = {
  port: Number(process.env.PORT || 3000),
  baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`,
  fromEmail: process.env.FROM_EMAIL || "",
  adminToken: process.env.ADMIN_TOKEN || "",
  databaseUrl: process.env.DATABASE_URL || "",
  pgSslMode: process.env.PGSSLMODE || "require",
  awsRegion: process.env.AWS_REGION || "us-east-2",
  s3Bucket: process.env.S3_BUCKET || "",
  bonusPackS3Key: process.env.BONUS_PACK_S3_KEY || "",
  signedUrlExpiresSeconds: Number(process.env.S3_SIGNED_URL_EXPIRES_SECONDS || 3600),
  confirmationDays: Number(process.env.CONFIRMATION_TOKEN_DAYS || 30),
};
