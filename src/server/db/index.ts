import { drizzle } from "drizzle-orm/libsql";
import * as schema from "~/server/db/schema";
import { client } from "~/server/db/client";

export const db = drizzle(client, {
  schema,
  logger: false,
});
