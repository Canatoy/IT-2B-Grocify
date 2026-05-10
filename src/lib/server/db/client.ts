import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const schema = {};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Database Url is required for API routes");
}

const sql = neon(databaseUrl);

export const db = drizzle({ client: sql, schema });
