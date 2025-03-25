import { betterAuth } from "better-auth";

import { env } from "@/env";
import { Accounts, Sessions, Users, Verifications, db } from "@scorebrawl/db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  plugins: [nextCookies()],
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    google: {
      enabled: true,
      clientId: env.GOOGLE_CLIENT_ID as string,
      clientSecret: env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: Users,
      account: Accounts,
      session: Sessions,
      verification: Verifications,
    },
  }),
});

export type Session = {
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
  };
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    image?: string;
  };
};
