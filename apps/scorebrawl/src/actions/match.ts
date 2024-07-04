"use server";

import { auth } from "@clerk/nextjs";
import type { CreateMatchInput } from "@scorebrawl/api";
import { MatchRepository } from "@scorebrawl/db";
import { cache } from "react";

export const create = async (val: Omit<CreateMatchInput, "userId">) =>
  MatchRepository.createMatch({ ...val, userId: auth().userId as string });

export const deleteMatch = async ({ matchId }: { matchId: string }) =>
  MatchRepository.deleteMatch({ matchId, userId: auth().userId as string });

export const getLatest = cache((leagueId: string) =>
  MatchRepository.getLatestMatch({ userId: auth().userId as string, leagueId }),
);
