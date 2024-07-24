import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { drizzle as localDrizzle } from "drizzle-orm/postgres-js";
import { migrate as localMigrator } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL ?? "";
export const db = process.env.VERCEL
  ? drizzle(neon(databaseUrl), {
      schema,
    })
  : localDrizzle(postgres(databaseUrl), { schema });

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
