import { type Config } from "drizzle-kit";

export default {
  out: "./migrations",
  schema: "./src/server/db/schema.ts",
  breakpoints: true,
  driver: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
} satisfies Config;
