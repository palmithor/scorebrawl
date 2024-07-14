import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../db";
import {
  leaguePlayers,
  leagues,
  matchPlayers,
  matches,
  seasonPlayers,
  seasons,
  users,
} from "../schema";

const getTopPlayer = async ({ seasonSlug }: { seasonSlug: string }) => {
  const [topPlayer] = await db
    .select({
      id: users.id,
      name: users.name,
      imageUrl: users.imageUrl,
    })
    .from(seasonPlayers)
    .innerJoin(seasons, and(eq(seasons.id, seasonPlayers.seasonId), eq(seasons.slug, seasonSlug)))
    .innerJoin(leagues, eq(seasons.leagueId, leagues.id))
    .innerJoin(leaguePlayers, eq(leaguePlayers.id, seasonPlayers.leaguePlayerId))
    .innerJoin(users, eq(users.id, leaguePlayers.userId))
    .orderBy(desc(seasonPlayers.score));

  return topPlayer;
};

const onFireStrugglingQuery = async ({
  seasonSlug,
  onFire,
}: {
  onFire: boolean;
  seasonSlug: string;
}) => {
  const recentMatchesSubquery = db
    .select({
      seasonPlayerId: matchPlayers.seasonPlayerId,
      matchId: matchPlayers.matchId,
      result: matchPlayers.result,
      createdAt: matches.createdAt,
      rowNumber:
        sql`ROW_NUMBER() OVER (PARTITION BY ${matchPlayers.seasonPlayerId} ORDER BY ${matches.createdAt} DESC)`.as(
          "rowNumber",
        ),
    })
    .from(matchPlayers)
    .innerJoin(matches, eq(matches.id, matchPlayers.matchId))
    .innerJoin(seasonPlayers, eq(seasonPlayers.id, matchPlayers.seasonPlayerId))
    .innerJoin(seasons, and(eq(seasons.slug, seasonSlug), eq(seasonPlayers.seasonId, seasons.id)))
    .as("recent_matches");

  const last5MatchesSubquery = db
    .select()
    .from(recentMatchesSubquery)
    .where(sql`${recentMatchesSubquery.rowNumber} <= 5`)
    .as("last_5_matches");

  const [playerStats] = await db
    .select({
      seasonPlayerId: last5MatchesSubquery.seasonPlayerId,
      totalGames: sql`COUNT(*)`.as("totalGames"),
      wins: sql`SUM(CASE WHEN ${last5MatchesSubquery.result} = 'W' THEN 1 ELSE 0 END)`.as("wins"),
      losses: sql`SUM(CASE WHEN ${last5MatchesSubquery.result} = 'L' THEN 1 ELSE 0 END)`.as(
        "losses",
      ),
      draws: sql`SUM(CASE WHEN ${last5MatchesSubquery.result} = 'D' THEN 1 ELSE 0 END)`.as("draws"),
      recentResults:
        sql`STRING_AGG(${last5MatchesSubquery.result}, ',' ORDER BY ${last5MatchesSubquery.createdAt} DESC)`.as(
          "recentResults",
        ),
    })
    .from(last5MatchesSubquery)
    .groupBy(last5MatchesSubquery.seasonPlayerId)
    .orderBy(
      desc(onFire ? sql`wins` : sql`losses`),
      desc(sql`draws`),
      desc(onFire ? sql`losses` : sql`wins`),
    )
    .limit(1);

  if (!playerStats) {
    return undefined;
  }

  const [playerOnFire] = await db
    .select({
      id: users.id,
      name: users.name,
      imageUrl: users.imageUrl,
    })
    .from(seasonPlayers)
    .innerJoin(leaguePlayers, eq(leaguePlayers.id, seasonPlayers.leaguePlayerId))
    .innerJoin(users, eq(users.id, leaguePlayers.userId))
    .where(eq(seasonPlayers.id, playerStats.seasonPlayerId));

  return {
    name: playerOnFire?.name as string,
    imageUrl: playerOnFire?.imageUrl as string,
    form: (playerStats?.recentResults as string).split(",") as ("W" | "D" | "L")[],
  };
};

export const getOnFire = async ({ seasonSlug }: { seasonSlug: string }) =>
  onFireStrugglingQuery({ seasonSlug, onFire: true });

export const getStruggling = async ({ seasonSlug }: { seasonSlug: string }) =>
  onFireStrugglingQuery({ seasonSlug, onFire: false });

export const SeasonPlayerRepository = {
  getOnFire,
  getStruggling,
  getTopPlayer,
};
