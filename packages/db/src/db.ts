import { upstashCache } from "drizzle-orm/cache/upstash";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL ?? "";
const client = postgres(databaseUrl, { prepare: false });
export const db = drizzle(client, {
  schema,
  cache:
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
      ? upstashCache({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
          global: true,
        })
      : undefined,
});

export const migrateDb = async () => {
  await migrate(drizzle(client), {
    migrationsFolder: "./migrations",
  });
};
