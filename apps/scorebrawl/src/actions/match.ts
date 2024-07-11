"use server";

import { auth } from "@clerk/nextjs/server";
import type { CreateMatchInput } from "@scorebrawl/api";
import { MatchRepository } from "@scorebrawl/db";

export const create = async (val: Omit<CreateMatchInput, "userId"> & { leagueId: string }) =>
  MatchRepository.create({ ...val, userId: auth().userId as string });

export const deleteMatch = async ({ matchId }: { matchId: string }) =>
  MatchRepository.removeDepr({ matchId, userId: auth().userId as string });
