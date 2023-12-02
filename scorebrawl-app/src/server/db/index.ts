import { drizzle } from "drizzle-orm/libsql";
import * as schema from "~/server/db/schema";
import { createClient } from "@libsql/client/web";
import { env } from "~/env.mjs";

export const client = createClient({
  url: env.DATABASE_URL,
  authToken: env.DATABASE_AUTH_TOKEN,
});
export const db = drizzle(client, {
  schema,
  logger: env.DEBUG !== undefined,
});
