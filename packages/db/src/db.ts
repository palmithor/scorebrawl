import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { type PostgresJsDatabase, drizzle as localDrizzle } from "drizzle-orm/postgres-js";
import { migrate as localMigrator } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "./schema";

const devDb = (): PostgresJsDatabase<typeof schema> => {
  if (globalThis.dbCache) {
    return globalThis.dbCache;
  }
  globalThis.dbCache = localDrizzle(postgres(databaseUrl), {
    schema,
    logger: false,
  });
  return globalThis.dbCache;
};

const databaseUrl = process.env.DATABASE_URL ?? "";
export const db = process.env.VERCEL
  ? drizzle(neon(databaseUrl), {
      schema,
    })
  : devDb();

export const migrateDb = async () => {
  if (process.env.VERCEL) {
    await migrate(drizzle(neon(databaseUrl)), {
      migrationsFolder: "./migrations",
    });
  } else {
    const migrateDrizzle = localDrizzle(postgres(databaseUrl, { max: 1 }));
    await localMigrator(migrateDrizzle, { migrationsFolder: "./migrations" });
  }
};
