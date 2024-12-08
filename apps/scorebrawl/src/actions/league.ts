"use server";

import { api } from "@/trpc/server";
import { RedirectType, redirect } from "next/navigation";
import { cache } from "react";

export const findLeagueBySlugWithUserRole = cache(async (leagueSlug: string) =>
  api.league.getLeagueBySlugAndRole({ leagueSlug }),
);

export const getLeagueBySlugWithUserRoleOrRedirect = cache(async (leagueSlug: string) => {
  try {
    return await api.league.getLeagueBySlugAndRole({ leagueSlug });
  } catch (_e) {}
  redirect("/?errorCode=LEAGUE_NOT_FOUND", RedirectType.replace);
});
