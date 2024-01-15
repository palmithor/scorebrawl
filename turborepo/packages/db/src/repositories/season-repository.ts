import { and, desc, eq, gte, isNull, lte, or } from "drizzle-orm";
import { ScoreBrawlError, canReadLeaguesCriteria, db, leagues, seasonPlayers, seasons } from "..";

export const getSeasonById = async ({ seasonId, userId }: { seasonId: string; userId: string }) => {
  const result = await db
    .select()
    .from(seasons)
    .innerJoin(leagues, eq(leagues.id, seasons.leagueId))
    .where(and(eq(seasons.id, seasonId), canReadLeaguesCriteria({ userId })))
    .get();
  if (!result?.season) {
    throw new ScoreBrawlError({
      code: "NOT_FOUND",
      message: "Season not found",
    });
  }
  return result.season;
};

export const findOngoingSeason = async ({
  leagueId,
  userId,
}: { leagueId: string; userId: string }) => {
  const now = new Date();
  const result = await db
    .select()
    .from(seasons)
    .innerJoin(leagues, eq(leagues.id, seasons.leagueId))
    .where(
      and(
        eq(seasons.leagueId, leagueId),
        lte(seasons.startDate, now),
        or(isNull(seasons.endDate), gte(seasons.endDate, now)),
        canReadLeaguesCriteria({ userId }),
      ),
    )
    .get();
  return result ? { ...result.season } : undefined;
};

export const getSeasonPlayers = async ({
  seasonId,
  userId,
}: { seasonId: string; userId: string }) => {
  // verify access
  await getSeasonById({ seasonId, userId });
  const seasonPlayerResult = await db.query.seasonPlayers.findMany({
    where: eq(seasonPlayers.seasonId, seasonId),
    extras: (_, { sql }) => ({
      matchCount:
        sql<number>`(SELECT COUNT(*) FROM match_player mp WHERE mp.season_player_id = "seasonPlayers"."id")`.as(
          "matchCount",
        ),
    }),
    with: {
      leaguePlayer: {
        columns: { userId: true },
        with: {
          user: {
            columns: { imageUrl: true, name: true },
          },
        },
      },
    },
    orderBy: desc(seasonPlayers.elo),
  });

  return seasonPlayerResult.map((sp) => ({
    id: sp.id,
    userId: sp.leaguePlayer.userId,
    name: sp.leaguePlayer.user.name,
    imageUrl: sp.leaguePlayer.user.imageUrl,
    elo: sp.elo,
    joinedAt: sp.createdAt,
    disabled: sp.disabled,
    matchCount: sp.matchCount,
  }));
};
