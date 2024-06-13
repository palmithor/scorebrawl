import { getById as getLeagueById } from "@/actions/league";
import { getByIdOrOngoing } from "@/actions/season";
import { FullPageSpinner } from "@/components/full-page-spinner";
import { ScoreBrawlError } from "@scorebrawl/db";
import { RedirectType, redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function ({
  params,
  children,
}: { params: { leagueSlug: string; seasonId: string }; children: ReactNode }) {
  const redirectUrl = await getRedirectUrl(params);
  if (redirectUrl) {
    redirect(redirectUrl, RedirectType.replace);
    return <FullPageSpinner />;
  }
  return <>{children}</>;
}

const getRedirectUrl = async ({
  leagueSlug,
  seasonId,
}: { leagueSlug: string; seasonId: string }) => {
  try {
    const season = await getByIdOrOngoing(seasonId, leagueSlug);
    if (!season) {
      return `/leagues/${leagueSlug}/overview?errorCode=${
        seasonId === "ongoing" ? "NOT_FOUND" : "FORBIDDEN"
      }`;
    }
    const league = await getLeagueById(season.leagueId);
    if (league.slug !== leagueSlug) {
      return `/leagues/${leagueSlug}/overview?errorCode=FORBIDDEN`;
    }
  } catch (e) {
    return `/?errorCode=${e instanceof ScoreBrawlError ? e.code : "UNKNOWN"}`;
  }
};
