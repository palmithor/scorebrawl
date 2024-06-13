import type { Config } from "drizzle-kit";

export default {
  out: "./migrations",
  schema: "../../packages/db/src/schema.ts",
  dialect: "postgresql",
  verbose: true,
  dbCredentials: {
    url: process.env.DRIZZLE_DATABASE_URL ?? "",
  },
} satisfies Config;
