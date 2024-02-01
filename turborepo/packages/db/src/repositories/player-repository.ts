import { eq } from "drizzle-orm";
import { getLeagueById } from ".";
import { db } from "../db";
import { leaguePlayers } from "../schema";

export const getLeaguePlayers = async ({ leagueId }: { leagueId: string }) => {
  const leaguePlayerResult = await db.query.leaguePlayers.findMany({
    columns: { id: true, createdAt: true, disabled: true, userId: true },
    where: eq(leaguePlayers.leagueId, leagueId),
    with: {
      user: {
        columns: { name: true, imageUrl: true },
      },
    },
  });

  return leaguePlayerResult.map((lp) => ({
    id: lp.id,
    userId: lp.userId,
    name: lp.user.name,
    imageUrl: lp.user.imageUrl,
    joinedAt: lp.createdAt,
    disabled: lp.disabled,
  }));
};

export const getLeaguePlayersForm = async ({
  leagueId,
  userId,
}: { leagueId: string; userId: string }) => {
  await getLeagueById({ leagueId, userId });
  const result = await db.query.leaguePlayers.findMany({
    columns: { id: true },
    where: eq(leaguePlayers.leagueId, leagueId),
    with: {
      user: {
        columns: { id: true, name: true, imageUrl: true },
      },
      seasonPlayers: {
        columns: { id: true },
        with: {
          season: { columns: { id: true } },
          matches: {
            columns: { result: true, createdAt: true },
            orderBy: (match, { desc }) => [desc(match.createdAt)],
            limit: 5,
          },
        },
      },
    },
  });
  return result.map((lp) => ({
    id: lp.id,
    userId: lp.user.id,
    name: lp.user.name,
    imageUrl: lp.user.imageUrl,
    form: lp.seasonPlayers
      .flatMap((season) => season.matches)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, Math.min(5, lp.seasonPlayers.flatMap((season) => season.matches).length))
      .map((m) => m.result)
      .reverse(),
  }));
};
