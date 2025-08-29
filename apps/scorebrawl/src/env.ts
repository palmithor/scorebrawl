import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.string().optional().default("production"),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    DATABASE_URL: z.string(),
    BETTER_AUTH_SECRET: z.string().min(1),
    DEBUG: z.string().min(8).optional(),
  },
  client: {
    NEXT_PUBLIC_ENABLE_USERNAME_PASSWORD: z.coerce.boolean().default(false),
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_ENABLE_USERNAME_PASSWORD: process.env.NEXT_PUBLIC_ENABLE_USERNAME_PASSWORD,
    NODE_ENV: process.env.NODE_ENV,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    DEBUG: process.env.DEBUG,
  },
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
});
