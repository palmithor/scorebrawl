import type { ResultSet } from "@libsql/client";
import { createClient } from "@libsql/client/web";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import { type LibSQLDatabase, drizzle } from "drizzle-orm/libsql";
import type { SQLiteTransaction } from "drizzle-orm/sqlite-core";
import * as schema from "./schema";

export const client = createClient({
  url: process.env.DATABASE_URL ?? "",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export type Db = LibSQLDatabase<typeof schema>;
export type DbTransaction = SQLiteTransaction<
  "async",
  ResultSet,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

export const db = drizzle(client, {
  schema,
  logger: process.env.DEBUG === "true",
});
