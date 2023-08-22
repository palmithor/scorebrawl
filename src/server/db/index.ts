import { drizzle } from "drizzle-orm/libsql";
import { client } from "~/server/db/client";
import * as schema from "~/server/db/schema";

export const db = drizzle(client, {
  schema,
  logger: false,
});
