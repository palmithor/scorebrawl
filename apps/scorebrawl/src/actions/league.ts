"use server";

import { api } from "@/trpc/server";
import { auth } from "@clerk/nextjs/server";
import type { UpdateTeamInput } from "@scorebrawl/api";
import { LeagueRepository, LeagueTeamRepository } from "@scorebrawl/db";
import { RedirectType, redirect } from "next/navigation";
import { cache } from "react";

export const findLeagueBySlugWithUserRole = cache((leagueSlug: string) =>
  api.league.getLeagueBySlugAndRole({ leagueSlug }),
);

export const getLeagueBySlugWithUserRoleOrRedirect = cache(async (leagueSlug: string) => {
  const league = await api.league.getLeagueBySlugAndRole({ leagueSlug });
  if (!league) {
    redirect("/?errorCode=LEAGUE_NOT_FOUND", RedirectType.replace);
  }
  return league;
});

export const updateTeam = async (val: Omit<UpdateTeamInput, "userId">) =>
  LeagueTeamRepository.updateTeam({ ...val, userId: auth().userId as string });

export const getTeams = cache((leagueId: string) =>
  LeagueTeamRepository.getLeagueTeams({ leagueId }),
);

export const getCode = cache((leagueId: string) =>
  LeagueRepository.getLeagueCode({ leagueId, userId: auth().userId as string }),
);

export const getHasEditorAccess = cache((leagueId: string) =>
  LeagueRepository.hasLeagueEditorAccess({ leagueId, userId: auth().userId as string }),
);

export const join = async (val: { code: string }) =>
  LeagueRepository.joinLeague({ code: val.code, userId: auth().userId as string });
