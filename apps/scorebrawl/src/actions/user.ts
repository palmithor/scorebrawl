"use server";

import { env } from "@/env.mjs";
import { auth } from "@clerk/nextjs";
import { createClerkClient } from "@clerk/nextjs/server";
import { UserRepository } from "@scorebrawl/db";

export const upsertAuthenticatedUser = async () => {
  const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });

  const userId = auth().userId;
  if (userId) {
    const clerkUser = await clerk.users.getUser(userId as string);
    UserRepository.upsertUser(clerkUser);
  }
};
