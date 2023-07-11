import { createClient } from "@libsql/client/web";
import { env } from "~/env.mjs";

export const client = createClient({
  url: env.DATABASE_URL,
  authToken: env.DATABASE_AUTH_TOKEN,
});
