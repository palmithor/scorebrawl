import { getById as getLeagueById } from "@/actions/league";
import { getByIdOrOngoing } from "@/actions/season";
import { ErrorCode, ScoreBrawlError } from "@scorebrawl/db";
import { RedirectType, redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function ({
  params,
  children,
}: { params: { leagueSlug: string; seasonId: string }; children: ReactNode }) {
  try {
    const season = await getByIdOrOngoing({
      seasonId: params.seasonId,
      leagueSlug: params.leagueSlug,
    });
    if (!season) {
      redirect(`/leagues/${params.leagueSlug}?errorCode=FORBIDDEN`, RedirectType.replace);
    }
    const league = await getLeagueById({ id: season.leagueId });
    if (league.slug !== params.leagueSlug) {
      redirect(`/leagues/${params.leagueSlug}?errorCode=FORBIDDEN`, RedirectType.replace);
    }
  } catch (e) {
    redirect(
      `/leagues?errorCode=${e instanceof ScoreBrawlError ? e.code : "UNKNOWN"}`,
      RedirectType.replace,
    );
  }
  return <>{children}</>;
}
