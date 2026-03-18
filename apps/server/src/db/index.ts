import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

const databaseUrl = process.env.DATABASE_URL ?? "postgres://aggrhub:aggrhub@localhost:5432/aggrhub";

const client = postgres(databaseUrl);

export const db = drizzle(client, { schema });
