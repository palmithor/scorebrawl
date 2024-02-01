"use server";

import { auth } from "@clerk/nextjs";
import { CreateLeagueInput, PageRequest } from "@scorebrawl/api";
import {
  ScoreBrawlError,
  createLeague,
  getAllLeagues,
  getHasLeagueEditorAccess,
  getLeagueById,
  getLeagueBySlug,
  getLeagueCode,
  getLeaguePlayers,
  getUserLeagues,
  joinLeague,
} from "@scorebrawl/db";
import { LeagueOmitCode } from "@scorebrawl/db/types";
import { RedirectType, redirect } from "next/navigation";
import { cache } from "react";

export const getBySlug = cache((params: { leagueSlug: string }) =>
  getLeagueBySlug({ userId: auth().userId as string, ...params }),
);

export const getById = cache((params: { id: string }) =>
  getLeagueById({ userId: auth().userId as string, ...params }),
);

export const getMine = cache(
  ({
    search,
    page = 0,
    limit = 30,
  }: {
    search?: string;
  } & PageRequest) =>
    getUserLeagues({ userId: auth().userId as string, search: search ?? "", page, limit }),
);

export const getAll = cache(
  ({ search, page = 0, limit = 30 }: { search?: string } & PageRequest) =>
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

export const join = async (val: { code: string }) =>
  joinLeague({ code: val.code, userId: auth().userId as string });

export const getLeagueOrRedirect = cache(async (leagueSlug: string) => {
  try {
    return await getLeagueBySlug({ leagueSlug, userId: auth().userId as string });
  } catch (e) {
    redirect(
      `/leagues?errorCode=${e instanceof ScoreBrawlError ? e.code : "UNKNOWN"}`,
      RedirectType.replace,
    );
  }
});
