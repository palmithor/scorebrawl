import {
  getBySlug,
  getCode,
  getHasEditorAccess,
  getLeagueOrRedirect,
  getPlayers,
} from "@/actions/league";
import { findOngoing, getPlayers as getSeasonPlayers } from "@/actions/season";
import { LeagueDetailsSubNav } from "@/components/league/league-details-sub-nav";
import { auth } from "@clerk/nextjs/server";
import { Metadata, ResolvingMetadata } from "next";
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

export default async function ({
  params,
  children,
}: {
  params: { leagueSlug: string };
  children: ReactNode;
}) {
  const league = await getLeagueOrRedirect(params.leagueSlug);
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
      {children}
    </LeagueDetailsSubNav>
  );
}
