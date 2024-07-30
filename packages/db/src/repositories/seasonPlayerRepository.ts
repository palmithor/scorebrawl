import type { SeasonPlayerDTO } from "@scorebrawl/api";
import { type SQL, and, desc, eq, sql } from "drizzle-orm";
import type z from "zod";
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

const getPointDiffProgression = async ({
  seasonId,
  condition,
}: {
  seasonId: string;
  condition?: SQL<unknown>;
}) => {
  const subQuery = db
    .select({
      seasonPlayerId: matchPlayers.seasonPlayerId,
      matchDate: sql<string>`DATE(${matchPlayers.createdAt})`.mapWith(String).as("match_date"),
      scoreBefore: matchPlayers.scoreBefore,
      scoreAfter: matchPlayers.scoreAfter,
      rnAsc:
        sql<number>`ROW_NUMBER() OVER (PARTITION BY ${matchPlayers.seasonPlayerId}, DATE(${matchPlayers.createdAt}) ORDER BY ${matchPlayers.createdAt}, ${matchPlayers.id})`
          .mapWith(Number)
          .as("rn_asc"),
      rnDesc:
        sql<number>`ROW_NUMBER() OVER (PARTITION BY ${matchPlayers.seasonPlayerId}, DATE(${matchPlayers.createdAt}) ORDER BY ${matchPlayers.createdAt} DESC, ${matchPlayers.id} DESC)`
          .mapWith(Number)
          .as("rn_desc"),
    })
    .from(matchPlayers)
    .innerJoin(seasonPlayers, eq(matchPlayers.seasonPlayerId, seasonPlayers.id))
    .where(
      condition
        ? and(eq(seasonPlayers.seasonId, seasonId), condition)
        : eq(seasonPlayers.seasonId, seasonId),
    );
  const rankedMatches = db.$with("ranked_matches").as(subQuery);
  const firstMatchAlias = sql`${rankedMatches} "first_match"`;
  const firstMatch = subQuery.as("first_match");
  const lastMatchAlias = sql`${rankedMatches} "last_match"`;
  const lastMatch = subQuery.as("last_match");

  return db
    .with(rankedMatches)
    .select({
      seasonPlayerId: seasonPlayers.id,
      matchDate: sql`"first_match"."match_date"`.mapWith(String),
      pointDiff: sql<number>`${lastMatch.scoreAfter} - ${firstMatch.scoreBefore}`.mapWith(Number),
    })
    .from(firstMatchAlias)
    .innerJoin(
      lastMatchAlias,
      and(
        eq(firstMatch.seasonPlayerId, lastMatch.seasonPlayerId),
        eq(sql`"first_match"."match_date"`, sql`"last_match"."match_date"`),
        eq(sql`"first_match"."rn_asc"`, 1),
        eq(sql`"last_match"."rn_desc"`, 1),
      ),
    )
    .innerJoin(seasonPlayers, eq(seasonPlayers.id, firstMatch.seasonPlayerId))
    .where(eq(seasonPlayers.seasonId, seasonId))
    .groupBy(
      seasonPlayers.id,
      lastMatch.scoreAfter,
      firstMatch.scoreBefore,
      sql`"first_match"."match_date"`,
    );
};

export const getAll = async ({ seasonId }: { seasonId: string }) => {
  const result = await db
    .select({
      seasonPlayerId: seasonPlayers.id,
      leaguePlayerId: seasonPlayers.leaguePlayerId,
      score: seasonPlayers.score,
      userId: users.id,
      name: users.name,
      imageUrl: users.imageUrl,
    })
    .from(seasonPlayers)
    .innerJoin(seasons, eq(seasons.id, seasonPlayers.seasonId))
    .innerJoin(leaguePlayers, eq(leaguePlayers.id, seasonPlayers.leaguePlayerId))
    .innerJoin(users, eq(users.id, leaguePlayers.userId))
    .where(eq(seasons.id, seasonId));

  return result.map(
    (sp) =>
      ({
        seasonPlayerId: sp.seasonPlayerId,
        leaguePlayerId: sp.leaguePlayerId,
        score: sp.score,
        user: { userId: sp.userId, name: sp.name, imageUrl: sp.imageUrl },
      }) satisfies z.infer<typeof SeasonPlayerDTO>,
  );
};

const matchesSubqueryBuilder = ({ seasonId }: { seasonId: string }) =>
  db
    .select({
      seasonPlayerId: matchPlayers.seasonPlayerId,
      leaguePlayerId: seasonPlayers.leaguePlayerId,
      score: seasonPlayers.score,
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
    .where(eq(seasonPlayers.seasonId, seasonId))
    .as("recent_matches");

const getStanding = async ({ seasonId }: { seasonId: string }) => {
  const matchesSubquery = matchesSubqueryBuilder({ seasonId });

  const playerStats = await db
    .select({
      seasonPlayerId: matchesSubquery.seasonPlayerId,
      totalGames: sql<number>`COUNT(*)`.mapWith(Number).as("totalGames"),
      wins: sql<number>`SUM(CASE WHEN ${matchesSubquery.result} = 'W' THEN 1 ELSE 0 END)`
        .mapWith(Number)
        .as("wins"),
      losses: sql<number>`SUM(CASE WHEN ${matchesSubquery.result} = 'L' THEN 1 ELSE 0 END)`
        .mapWith(Number)
        .as("losses"),
      draws: sql<number>`SUM(CASE WHEN ${matchesSubquery.result} = 'D' THEN 1 ELSE 0 END)`
        .mapWith(Number)
        .as("draws"),
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
      leaguePlayerId: seasonPlayers.leaguePlayerId,
      score: seasonPlayers.score,
      userId: users.id,
      name: users.name,
      imageUrl: users.imageUrl,
    })
    .from(seasonPlayers)
    .innerJoin(leaguePlayers, eq(leaguePlayers.id, seasonPlayers.leaguePlayerId))
    .innerJoin(users, eq(users.id, leaguePlayers.userId))
    .where(eq(seasonPlayers.seasonId, seasonId))
    .orderBy(desc(seasonPlayers.score));

  const pointDiff = await getPointDiffProgression({
    seasonId,
    condition: eq(sql`DATE(${matchPlayers.createdAt})`, sql`CURRENT_DATE`),
  });

  return players.map((p) => {
    const stats = playerStats.find((ps) => ps.seasonPlayerId === p.seasonPlayerId);
    const form = (stats?.recentResults as string)?.split(",")?.slice(0, 5) ?? [];

    return {
      seasonPlayerId: p.seasonPlayerId,
      leaguePlayerId: p.leaguePlayerId,
      score: p.score,
      matchCount: stats?.totalGames ?? 0,
      winCount: stats?.wins ?? 0,
      lossCount: stats?.losses ?? 0,
      drawCount: stats?.draws ?? 0,
      form: (form as ("W" | "D" | "L")[]).reverse(),
      pointDiff: pointDiff.find((pd) => pd.seasonPlayerId === p.seasonPlayerId)?.pointDiff ?? 0,
      user: { userId: p.userId, name: p.name, imageUrl: p.imageUrl },
    };
  });
};

const getTopPlayer = async ({ seasonId }: { seasonId: string }) => {
  const [topPlayer] = await db
    .select({
      seasonPlayerId: seasonPlayers.id,
      leaguePlayerId: leaguePlayers.id,
      score: seasonPlayers.score,
      userId: users.id,
      name: users.name,
      imageUrl: users.imageUrl,
    })
    .from(seasonPlayers)
    .innerJoin(seasons, and(eq(seasons.id, seasonPlayers.seasonId)))
    .innerJoin(leagues, eq(seasons.leagueId, leagues.id))
    .innerJoin(leaguePlayers, eq(leaguePlayers.id, seasonPlayers.leaguePlayerId))
    .innerJoin(users, eq(users.id, leaguePlayers.userId))
    .where(eq(seasonPlayers.seasonId, seasonId))
    .orderBy(desc(seasonPlayers.score));

  return {
    seasonPlayerId: topPlayer?.seasonPlayerId,
    leaguePlayerId: topPlayer?.leaguePlayerId,
    score: topPlayer?.score,
    user: {
      userId: topPlayer?.userId,
      name: topPlayer?.name,
      imageUrl: topPlayer?.imageUrl,
    },
  };
};

const getPointProgression = async ({ seasonId }: { seasonId: string }) => {
  const rankedScores = db.$with("ranked_scores").as(
    db
      .select({
        seasonPlayerId: matchPlayers.seasonPlayerId,
        seasonId: seasonPlayers.seasonId,
        score: matchPlayers.scoreAfter,
        createdAt: matchPlayers.createdAt,
        rowNumber:
          sql<number>`ROW_NUMBER() OVER (PARTITION BY ${matchPlayers.seasonPlayerId} ORDER BY ${matchPlayers.createdAt})`
            .mapWith(Number)
            .as("rowNumber"),
      })
      .from(matchPlayers)
      .innerJoin(seasonPlayers, eq(seasonPlayers.id, matchPlayers.seasonPlayerId))
      .where(eq(seasonPlayers.seasonId, seasonId)),
  );

  return db
    .with(rankedScores)
    .select({
      seasonPlayerId: rankedScores.seasonPlayerId,
      score: rankedScores.score,
      createdAt: rankedScores.createdAt,
    })
    .from(rankedScores)
    .where(and(eq(rankedScores.rowNumber, 1), eq(rankedScores.seasonId, seasonId)))
    .orderBy(rankedScores.seasonPlayerId, rankedScores.createdAt);
};

const onFireStrugglingQuery = async ({
  seasonId,
  onFire,
}: {
  onFire: boolean;
  seasonId: string;
}) => {
  const recentMatchesSubquery = matchesSubqueryBuilder({ seasonId });
  const last5MatchesSubquery = db
    .select()
    .from(recentMatchesSubquery)
    .where(sql`${recentMatchesSubquery.rowNumber} <= 5`)
    .as("last_5_matches");

  const [playerStats] = await db
    .select({
      seasonPlayerId: last5MatchesSubquery.seasonPlayerId,
      leaguePlayerId: last5MatchesSubquery.leaguePlayerId,
      score: last5MatchesSubquery.score,
      totalGames: sql<number>`COUNT(*)`.mapWith(Number).as("totalGames"),
      wins: sql<number>`SUM(CASE WHEN ${last5MatchesSubquery.result} = 'W' THEN 1 ELSE 0 END)`
        .mapWith(Number)
        .as("wins"),
      losses: sql<number>`SUM(CASE WHEN ${last5MatchesSubquery.result} = 'L' THEN 1 ELSE 0 END)`
        .mapWith(Number)
        .as("losses"),
      draws: sql<number>`SUM(CASE WHEN ${last5MatchesSubquery.result} = 'D' THEN 1 ELSE 0 END)`
        .mapWith(Number)
        .as("draws"),
      recentResults:
        sql`STRING_AGG(${last5MatchesSubquery.result}, ',' ORDER BY ${last5MatchesSubquery.createdAt} DESC)`.as(
          "recentResults",
        ),
    })
    .from(last5MatchesSubquery)
    .groupBy(
      last5MatchesSubquery.seasonPlayerId,
      last5MatchesSubquery.leaguePlayerId,
      last5MatchesSubquery.score,
    )
    .orderBy(
      desc(onFire ? sql`wins` : sql`losses`),
      desc(sql`draws`),
      desc(onFire ? sql`losses` : sql`wins`),
    )
    .limit(1);

  if (!playerStats) {
    return undefined;
  }

  const [userInfo] = await db
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
    seasonPlayerId: playerStats?.seasonPlayerId,
    leaguePlayerId: playerStats?.leaguePlayerId,
    score: playerStats?.score,
    matchCount: playerStats?.totalGames,
    winCount: playerStats?.wins,
    lossCount: playerStats?.losses,
    drawCount: playerStats?.draws,
    form: (form as ("W" | "D" | "L")[]).reverse(),
    user: {
      userId: userInfo?.userId,
      name: userInfo?.name,
      imageUrl: userInfo?.imageUrl,
    },
  };
};

export const getOnFire = async ({ seasonId }: { seasonId: string }) =>
  onFireStrugglingQuery({ seasonId, onFire: true });

export const getStruggling = async ({ seasonId }: { seasonId: string }) =>
  onFireStrugglingQuery({ seasonId, onFire: false });

export const SeasonPlayerRepository = {
  getAll,
  getPointDiffProgression,
  getPointProgression,
  getStanding,
  getOnFire,
  getStruggling,
  getTopPlayer,
};
