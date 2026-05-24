import { Pool } from "pg";
import { config } from "./config.js";

export const pool = config.databaseUrl
  ? new Pool({
      connectionString: config.databaseUrl,
      ssl: config.pgSslMode === "disable" ? false : { rejectUnauthorized: false },
    })
  : null;

export function requireDb() {
  if (!pool) {
    throw new Error("DATABASE_URL is required for this operation.");
  }
  return pool;
}

