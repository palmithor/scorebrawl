"use server";

import { auth } from "@clerk/nextjs";
import { CreateLeagueInput } from "@scorebrawl/api";
import {
  createLeague,
  getAllLeagues,
  getHasLeagueEditorAccess,
  getLeagueBySlug,
  getLeagueCode,
  getLeaguePlayers,
  getUserLeagues,
} from "@scorebrawl/db";
import { LeagueOmitCode } from "@scorebrawl/db/src/types";
import { cache } from "react";

export const getBySlug = cache((params: { slug: string }) =>
  getLeagueBySlug({ userId: auth().userId as string, ...params }),
);
export const getMine = cache(
  ({
    search,
    page = 0,
    limit = 30,
  }: {
    search?: string;
    page?: number;
    limit?: number;
  }) => getUserLeagues({ userId: auth().userId as string, search: search ?? "", page, limit }),
);

export const getAll = cache(
  ({ search, page = 0, limit = 30 }: { search?: string; page?: number; limit?: number }) =>
    getAllLeagues({ userId: auth().userId as string, search: search ?? "", page, limit }),
);

export const getPlayers = cache(({ leagueId }: { leagueId: string }) =>
  getLeaguePlayers({ leagueId }),
);

export const getCode = cache(({ league }: { league: LeagueOmitCode }) =>
  getLeagueCode({ league, userId: auth().userId as string }),
);

export const getHasEditorAccess = cache(({ leagueId }: { leagueId: string }) =>
  getHasLeagueEditorAccess({ leagueId, userId: auth().userId as string }),
);

export const create = async (val: Omit<CreateLeagueInput, "userId">) =>
  createLeague({ ...val, userId: auth().userId as string });
