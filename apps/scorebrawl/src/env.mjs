import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    CLERK_SECRET_KEY: z.string().min(1),
    DRIZZLE_DATABASE_URL: z.string(),
    CLERK_WEBHOOK_SECRET: z.string().optional(),
    DEBUG: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  },
  runtimeEnv: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
    DRIZZLE_DATABASE_URL: process.env.DRIZZLE_DATABASE_URL,
    DEBUG: process.env.DEBUG,
  },
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
});
