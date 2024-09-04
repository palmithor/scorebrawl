"use server";

import { api } from "@/trpc/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const clearLastVisitedLeague = async () => {
  cookies().delete("last-visited-league");
};

export const resetLastVisitedLeague = async ({
  leagueSlug,
}: {
  leagueSlug: string;
}) => {
  cookies().set("last-visited-league", leagueSlug, { path: "/" });
};

export const redirectToLeagueOrOnboarding = async () => {
  const lastVisitedLeague = cookies().get("last-visited-league");
  if (lastVisitedLeague) {
    redirect(`/leagues/${lastVisitedLeague.value}`);
  } else {
    const me = await api.user.me();
    const leagues = await api.league.getAll({});
    const defaultLeagueSlug = leagues.find((l) => l.id === me.defaultLeagueId)?.slug;
    if (defaultLeagueSlug) {
      redirect(`/leagues/${defaultLeagueSlug}`);
    } else if (leagues.length > 0 && leagues[0]?.slug) {
      redirect(`/leagues/${leagues[0].slug}`);
    } else {
      redirect("/onboarding");
    }
  }
};
