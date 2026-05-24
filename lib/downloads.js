import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "./config.js";

const s3 = new S3Client({ region: config.awsRegion });

export async function getBonusPackUrl() {
  if (!config.s3Bucket) {
    return null;
  }

  return getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: config.s3Bucket,
      Key: config.bonusPackS3Key,
    }),
    { expiresIn: config.signedUrlExpiresSeconds }
  );
}

