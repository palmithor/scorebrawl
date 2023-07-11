import path from "path";
import fsExtra from "fs-extra";
import { migrate } from "drizzle-orm/libsql/migrator";
import { BASE_DATABASE_PATH, BASE_DATABASE_URL } from "./paths";
import * as schema from "~/server/db/schema";
import { drizzle } from "drizzle-orm/libsql";
import { createTestDbClient } from "./utils";
import { createClient } from "@libsql/client";

export async function setup() {
  await fsExtra.ensureDir(path.dirname(BASE_DATABASE_PATH));
  await ensureDbReady();
  return async function teardown() {};
}

async function ensureDbReady() {
  const client = createClient({
    url: BASE_DATABASE_URL,
  });

  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: "./migrations" });
}
