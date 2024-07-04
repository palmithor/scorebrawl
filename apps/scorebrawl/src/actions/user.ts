"use server";

import { env } from "@/env.mjs";
import { auth } from "@clerk/nextjs";
import { createClerkClient } from "@clerk/nextjs/server";
import { UserRepository } from "@scorebrawl/db";
import { cache } from "react";

export const getAuthenticatedUser = cache(() =>
  UserRepository.findUserById({ id: auth().userId as string }),
);

export const upsertAuthenticatedUser = async () => {
  const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });

  const clerkUser = await clerk.users.getUser(auth().userId as string);
  UserRepository.upsertUser(clerkUser);
};
