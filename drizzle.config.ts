import "dotenv/config";
import { type Config } from "drizzle-kit";
import { env } from "~/env.mjs";

export default {
  out: "./migrations",
  schema: "./src/server/db/schema.ts",
  breakpoints: true,
  driver: "turso",
  dbCredentials: {
    url: env.DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN,
  },
} satisfies Config;
