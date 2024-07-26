import {
  findLeagueBySlugWithUserRole,
  getCode,
  getHasEditorAccess,
  getLeagueBySlugWithUserRoleOrRedirect,
} from "@/actions/league";
import { LeagueDetailsSubNav } from "@/components/league/league-details-sub-nav";
import { api } from "@/trpc/server";
import { auth } from "@clerk/nextjs/server";
import type { Metadata, ResolvingMetadata } from "next";
import type { ReactNode } from "react";

export async function generateMetadata(
  { params: { leagueSlug } }: { params: { leagueSlug: string } },
  _parent: ResolvingMetadata,
): Promise<Metadata> {
  const league = { name: "" };
  try {
    const leagueBySlug = await findLeagueBySlugWithUserRole(leagueSlug);
    league.name = leagueBySlug?.name ?? "Unknown";
  } catch (_e) {
    // ignore
  }

  return {
    title: league.name,
  };
}

export default async function ({
  params: { leagueSlug },
  children,
}: {
  params: { leagueSlug: string };
  children: ReactNode;
}) {
  const league = await getLeagueBySlugWithUserRoleOrRedirect(leagueSlug);
  const leaguePlayers = await api.leaguePlayer.getAll({ leagueSlug });
  const ongoingSeason = await api.season.findOngoing({ leagueSlug });
  const ongoingSeasonPlayers = ongoingSeason
    ? await api.seasonPlayer.getAll({ leagueSlug, seasonSlug: ongoingSeason.slug })
    : [];
  const code = await getCode(league.id);
  const hasEditorAccess = await getHasEditorAccess(league.id);
  const userId = auth().userId as string;
  const hasTwoPlayersOrMore = ongoingSeasonPlayers && ongoingSeasonPlayers.length > 1;

  return (
    <>
      <LeagueDetailsSubNav
        league={league}
        shouldShowJoin={!!(code && !leaguePlayers.some((lp) => lp?.user.userId === userId))}
        hasEditorAccess={hasEditorAccess}
        inviteCode={code}
        ongoingSeason={ongoingSeason}
        hasTwoPlayersOrMore={hasTwoPlayersOrMore}
      />
      {children}
    </>
  );
}
