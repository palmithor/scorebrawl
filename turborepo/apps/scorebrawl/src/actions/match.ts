"use server";

import { auth } from "@clerk/nextjs";
import { CreateMatchInput } from "@scorebrawl/api";
import { createMatch, getLatestMatch } from "@scorebrawl/db";
import { deleteMatch as repositoryDeleteMatch } from "@scorebrawl/db";
import { cache } from "react";

export const create = async (val: Omit<CreateMatchInput, "userId">) =>
  createMatch({ ...val, userId: auth().userId as string });

export const deleteMatch = async ({ matchId }: { matchId: string }) =>
  repositoryDeleteMatch({ matchId, userId: auth().userId as string });

export const getLatest = cache((params: { leagueId: string }) =>
  getLatestMatch({ userId: auth().userId as string, ...params }),
);
