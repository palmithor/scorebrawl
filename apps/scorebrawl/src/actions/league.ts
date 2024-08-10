"use server";

import { api } from "@/trpc/server";
import { auth } from "@clerk/nextjs/server";
import { LeagueRepository } from "@scorebrawl/db";
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
cache((leagueId: string) =>
  LeagueRepository.hasLeagueEditorAccess({
    leagueId,
    userId: auth().userId as string,
  }),
);
