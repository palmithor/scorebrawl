import { type Config } from "drizzle-kit";

export default {
  out: "./migrations",
  schema: "../../packages/db/src/schema.ts",
  breakpoints: false,
  driver: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
} satisfies Config;
