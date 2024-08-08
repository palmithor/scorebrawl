import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

import * as schema from "./schema";

export const client = createClient({
  url: process.env.DATABASE_URL ?? "",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, {
  schema,
  logger: process.env.DEBUG === "true",
});

export const migrateDb = async () => {
  await migrate(db, { migrationsFolder: "./migrations" });
};
