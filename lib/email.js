import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
import { config } from "./config.js";

const ses = new SESClient({ region: config.awsRegion });

export async function sendEmail({ to, subject, html, text }) {
  const command = new SendEmailCommand({
    Source: config.fromEmail,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject, Charset: "UTF-8" },
      Body: {
        Html: { Data: html, Charset: "UTF-8" },
        Text: { Data: text || stripHtml(html), Charset: "UTF-8" },
      },
    },
  });

  return ses.send(command);
}

function stripHtml(html) {
  return String(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

