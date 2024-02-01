"use server";

import { env } from "@/env.mjs";
import { auth } from "@clerk/nextjs";
import {
  type SignedInAuthObject,
  type SignedOutAuthObject,
  createClerkClient,
  getAuth,
} from "@clerk/nextjs/server";
import { CreateLeagueInput, PageRequest } from "@scorebrawl/api";
import {
  ScoreBrawlError,
  createLeague,
  findUserById,
  getAllLeagues,
  getHasLeagueEditorAccess,
  getLeagueById,
  getLeagueBySlug,
  getLeagueCode,
  getLeaguePlayers,
  getUserLeagues,
  joinLeague,
  upsertUser,
} from "@scorebrawl/db";
import { LeagueOmitCode } from "@scorebrawl/db/types";
import { RedirectType, redirect } from "next/navigation";
import { cache } from "react";

export const getAuthenticatedUser = cache(() => findUserById({ id: auth().userId as string }));

export const upsertAuthenticatedUser = async () => {
  const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });

  const clerkUser = await clerk.users.getUser(auth().userId as string);
  upsertUser(clerkUser);
};
