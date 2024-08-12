"use server";

import { api } from "@/trpc/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const resetLastVisitedLeague = async ({ leagueSlug }: { leagueSlug: string }) => {
  cookies().set("last-visited-league", leagueSlug);
};

export const redirectToLeagueOrOnboarding = async () => {
  const lastVisitedLeague = cookies().get("last-visited-league");
  if (lastVisitedLeague) {
    redirect(`/leagues/${lastVisitedLeague.value}`);
  } else {
    const leagues = await api.league.getAll({});
    if (leagues.length > 0 && leagues[0]?.slug) {
      redirect(`/leagues/${leagues[0].slug}`);
    } else {
      redirect("/onboarding");
    }
  }
};
