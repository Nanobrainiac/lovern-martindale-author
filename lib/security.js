import crypto from "node:crypto";

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function newToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function hashIp(value = "") {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

