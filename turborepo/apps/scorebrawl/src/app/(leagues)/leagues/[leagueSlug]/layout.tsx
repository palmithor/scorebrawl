import { getBySlug, getCode, getHasEditorAccess, getPlayers } from "@/actions/league";
import { findOngoing, getPlayers as getSeasonPlayers } from "@/actions/season";
import { LeagueDetailsSubNav } from "@/components/league/league-details-sub-nav";
import { auth } from "@clerk/nextjs/server";
import { ScoreBrawlError } from "@scorebrawl/db";
import { LeagueOmitCode } from "@scorebrawl/db/src/types";
import { Metadata, ResolvingMetadata } from "next";
import { RedirectType, redirect } from "next/navigation";
import { ReactNode } from "react";

export async function generateMetadata(
  { params }: { params: { leagueSlug: string } },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const league = { name: "" };
  try {
    const { name } = await getBySlug({ slug: params.leagueSlug });
    league.name = name;
  } catch (e) {
    // ignore
  }

  return {
    title: league.name,
  };
}

export default async function LeagueLayout({
  params,
  children,
}: {
  params: { leagueSlug: string };
  children: ReactNode;
}) {
  let league: LeagueOmitCode | undefined;
  try {
    league = await getBySlug({ slug: params.leagueSlug });
  } catch (e) {
    redirect(
      `/leagues?errorCode=${e instanceof ScoreBrawlError ? e.code : "UNKNOWN"}`,
      RedirectType.replace,
    );
  }
  const leaguePlayers = await getPlayers({ leagueId: league.id });
  const ongoingSeason = await findOngoing({ leagueId: league.id });
  const ongoingSeasonPlayers = ongoingSeason
    ? await getSeasonPlayers({ seasonId: ongoingSeason.id })
    : [];
  const code = await getCode({ league });
  const hasEditorAccess = await getHasEditorAccess({ leagueId: league.id });
  const userId = auth().userId as string;
  const hasTwoPlayersOrMore = ongoingSeasonPlayers && ongoingSeasonPlayers.length > 1;

  return (
    <LeagueDetailsSubNav
      league={league}
      shouldShowJoin={!!(code && !leaguePlayers.some((u) => u?.userId === userId))}
      hasEditorAccess={hasEditorAccess}
      inviteCode={code}
      ongoingSeason={ongoingSeason}
      shouldEnableAddMatch={hasTwoPlayersOrMore && !!ongoingSeason}
      shouldShowAddMatch={leaguePlayers?.some((p) => p.userId === userId)}
    >
      <h1>overview</h1>
    </LeagueDetailsSubNav>
  );
}
