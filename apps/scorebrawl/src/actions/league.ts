"use server";

import { auth } from "@clerk/nextjs";
import type { CreateLeagueInput, UpdateTeamInput } from "@scorebrawl/api";
import {
  ScoreBrawlError,
  createLeague,
  getHasLeagueEditorAccess,
  getLeagueById,
  getLeagueBySlug,
  getLeagueCode,
  getLeaguePlayers,
  getLeaguePlayersForm,
  getLeagueStats,
  getLeagueTeams,
  getUserLeagues,
  joinLeague,
  updateTeam as updateTeamDb,
} from "@scorebrawl/db";
import type { LeagueOmitCode } from "@scorebrawl/db/types";
import { RedirectType, redirect } from "next/navigation";
import { cache } from "react";

export const getBySlug = cache((leagueSlug: string) =>
  getLeagueBySlug({ userId: auth().userId as string, leagueSlug }),
);

export const getById = cache((leagueId: string) =>
  getLeagueById({ userId: auth().userId as string, leagueId }),
);

export const getAll = cache((search?: string, page = 0, limit = 30) =>
  getUserLeagues({
    userId: auth().userId as string,
    search: search ?? "",
    page,
    limit,
  }),
);

export const getPlayers = cache((leagueId: string) => getLeaguePlayers({ leagueId }));

export const updateTeam = async (val: Omit<UpdateTeamInput, "userId">) =>
  updateTeamDb({ ...val, userId: auth().userId as string });

export const getTeams = cache((leagueId: string) => getLeagueTeams({ leagueId }));

export const getCode = cache(({ league }: { league: LeagueOmitCode }) =>
  getLeagueCode({ league, userId: auth().userId as string }),
);

export const getStats = cache((leagueId: string) =>
  getLeagueStats({ leagueId, userId: auth().userId as string }),
);

export const getPlayersForm = cache(async (leagueId: string) => {
  const leaguePlayers = await getLeaguePlayersForm({
    leagueId,
    userId: auth().userId as string,
  });
  return leaguePlayers.map((lp) => {
    const formScore = lp.form.reduce(
      (sum, result) => sum + (result === "W" ? 3 : result === "D" ? 1 : 0),
      0,
    );
    return { ...lp, formScore };
  });
});

export const getHasEditorAccess = cache((leagueId: string) =>
  getHasLeagueEditorAccess({ leagueId, userId: auth().userId as string }),
);

export const create = async (val: Omit<CreateLeagueInput, "userId">) =>
  createLeague({ ...val, userId: auth().userId as string });

export const join = async (val: { code: string }) =>
  joinLeague({ code: val.code, userId: auth().userId as string });

export const getLeagueOrRedirect = cache(async (leagueSlug: string) => {
  try {
    return await getLeagueBySlug({
      leagueSlug,
      userId: auth().userId as string,
    });
  } catch (e) {
    redirect(
      `?errorCode=${e instanceof ScoreBrawlError ? e.code : "UNKNOWN"}`,
      RedirectType.replace,
    );
  }
});
