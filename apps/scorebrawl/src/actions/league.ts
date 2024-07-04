"use server";

import { auth } from "@clerk/nextjs";
import type { CreateLeagueInput, UpdateTeamInput } from "@scorebrawl/api";
import {
  LeagueRepository,
  PlayerRepository,
  ScoreBrawlError,
  TeamRepository,
} from "@scorebrawl/db";
import type { LeagueOmitCode } from "@scorebrawl/db/types";
import { RedirectType, redirect } from "next/navigation";
import { cache } from "react";

export const getBySlug = cache((leagueSlug: string) =>
  LeagueRepository.getLeagueBySlug({ userId: auth().userId as string, leagueSlug }),
);

export const getById = cache((leagueId: string) =>
  LeagueRepository.getLeagueById({ userId: auth().userId as string, leagueId }),
);

export const getPlayers = cache((leagueId: string) =>
  PlayerRepository.getLeaguePlayers({ leagueId }),
);

export const updateTeam = async (val: Omit<UpdateTeamInput, "userId">) =>
  TeamRepository.updateTeam({ ...val, userId: auth().userId as string });

export const getTeams = cache((leagueId: string) => TeamRepository.getLeagueTeams({ leagueId }));

export const getCode = cache(({ league }: { league: LeagueOmitCode }) =>
  LeagueRepository.getLeagueCode({ league, userId: auth().userId as string }),
);

export const getStats = cache((leagueId: string) =>
  LeagueRepository.getLeagueStats({ leagueId, userId: auth().userId as string }),
);

export const getPlayersForm = cache(async (leagueId: string) => {
  const leaguePlayers = await PlayerRepository.getLeaguePlayersForm({
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
  LeagueRepository.hasLeagueEditorAccess({ leagueId, userId: auth().userId as string }),
);

export const create = async (val: Omit<CreateLeagueInput, "userId">) =>
  LeagueRepository.createLeague({ ...val, userId: auth().userId as string });

export const join = async (val: { code: string }) =>
  LeagueRepository.joinLeague({ code: val.code, userId: auth().userId as string });

export const getLeagueOrRedirect = cache(async (leagueSlug: string) => {
  try {
    return await LeagueRepository.getLeagueBySlug({
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
