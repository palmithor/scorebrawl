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

const matchesSubqueryBuilder = ({ seasonSlug }: { seasonSlug: string }) =>
  db
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

const getStanding = async ({ seasonSlug }: { seasonSlug: string }) => {
  const matchesSubquery = matchesSubqueryBuilder({ seasonSlug });

  // New subquery to calculate point difference for the current day
  const pointDiffSubquery = db
    .select({
      seasonPlayerId: matchPlayers.seasonPlayerId,
      pointDiff: sql<number>`MAX(${matchPlayers.scoreAfter}) - MIN(${matchPlayers.scoreBefore})`.as(
        "pointDiff",
      ),
    })
    .from(matchPlayers)
    .innerJoin(matches, eq(matches.id, matchPlayers.matchId))
    .innerJoin(seasons, eq(seasons.id, matches.seasonId))
    .where(and(eq(seasons.slug, seasonSlug), sql`DATE(${matches.createdAt}) = CURRENT_DATE`))
    .groupBy(matchPlayers.seasonPlayerId)
    .as("point_diff");

  const playerStats = await db
    .select({
      seasonPlayerId: matchesSubquery.seasonPlayerId,
      totalGames: sql<number>`COUNT(*)`.as("totalGames"),
      wins: sql<number>`SUM(CASE WHEN ${matchesSubquery.result} = 'W' THEN 1 ELSE 0 END)`.as(
        "wins",
      ),
      losses: sql<number>`SUM(CASE WHEN ${matchesSubquery.result} = 'L' THEN 1 ELSE 0 END)`.as(
        "losses",
      ),
      draws: sql<number>`SUM(CASE WHEN ${matchesSubquery.result} = 'D' THEN 1 ELSE 0 END)`.as(
        "draws",
      ),
      recentResults:
        sql`STRING_AGG(${matchesSubquery.result}, ',' ORDER BY ${matchesSubquery.createdAt} DESC)`.as(
          "recentResults",
        ),
    })
    .from(matchesSubquery)
    .groupBy(matchesSubquery.seasonPlayerId);

  const players = await db
    .select({
      seasonPlayerId: seasonPlayers.id,
      score: seasonPlayers.score,
      userId: users.id,
      name: users.name,
      imageUrl: users.imageUrl,
      pointDiff: pointDiffSubquery.pointDiff,
    })
    .from(seasonPlayers)
    .innerJoin(seasons, and(eq(seasons.id, seasonPlayers.seasonId), eq(seasons.slug, seasonSlug)))
    .innerJoin(leaguePlayers, eq(leaguePlayers.id, seasonPlayers.leaguePlayerId))
    .innerJoin(users, eq(users.id, leaguePlayers.userId))
    .leftJoin(pointDiffSubquery, eq(pointDiffSubquery.seasonPlayerId, seasonPlayers.id))
    .orderBy(desc(seasonPlayers.score));

  return players.map((p) => {
    const stats = playerStats.find((ps) => ps.seasonPlayerId === p.seasonPlayerId);
    const form = (stats?.recentResults as string)?.split(",")?.slice(0, 5) ?? [];

    return {
      seasonPlayerId: p.seasonPlayerId,
      name: p.name,
      imageUrl: p.imageUrl,
      score: p.score,
      matchCount: stats?.totalGames ?? 0,
      winCount: stats?.wins ?? 0,
      lossCount: stats?.losses ?? 0,
      drawCount: stats?.draws ?? 0,
      form: (form as ("W" | "D" | "L")[]).reverse(),
      pointDiff: p.pointDiff ?? 0, // Add this line to include the point difference
    };
  });
};

const getTopPlayer = async ({ seasonSlug }: { seasonSlug: string }) => {
  const [topPlayer] = await db
    .select({
      userId: users.id,
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
  const recentMatchesSubquery = matchesSubqueryBuilder({ seasonSlug });
  const last5MatchesSubquery = db
    .select()
    .from(recentMatchesSubquery)
    .where(sql`${recentMatchesSubquery.rowNumber} <= 5`)
    .as("last_5_matches");

  const [playerStats] = await db
    .select({
      seasonPlayerId: last5MatchesSubquery.seasonPlayerId,
      totalGames: sql<number>`COUNT(*)`.as("totalGames"),
      wins: sql<number>`SUM(CASE WHEN ${last5MatchesSubquery.result} = 'W' THEN 1 ELSE 0 END)`.as(
        "wins",
      ),
      losses: sql<number>`SUM(CASE WHEN ${last5MatchesSubquery.result} = 'L' THEN 1 ELSE 0 END)`.as(
        "losses",
      ),
      draws: sql<number>`SUM(CASE WHEN ${last5MatchesSubquery.result} = 'D' THEN 1 ELSE 0 END)`.as(
        "draws",
      ),
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
      userId: users.id,
      name: users.name,
      imageUrl: users.imageUrl,
    })
    .from(seasonPlayers)
    .innerJoin(leaguePlayers, eq(leaguePlayers.id, seasonPlayers.leaguePlayerId))
    .innerJoin(users, eq(users.id, leaguePlayers.userId))
    .where(eq(seasonPlayers.id, playerStats.seasonPlayerId));

  const form = (playerStats?.recentResults as string)?.split(",")?.slice(0, 5) ?? [];
  return {
    name: playerOnFire?.name as string,
    imageUrl: playerOnFire?.imageUrl as string,
    form: (form as ("W" | "D" | "L")[]).reverse(),
  };
};

export const getOnFire = async ({ seasonSlug }: { seasonSlug: string }) =>
  onFireStrugglingQuery({ seasonSlug, onFire: true });

export const getStruggling = async ({ seasonSlug }: { seasonSlug: string }) =>
  onFireStrugglingQuery({ seasonSlug, onFire: false });

export const SeasonPlayerRepository = {
  getStanding,
  getOnFire,
  getStruggling,
  getTopPlayer,
};
