import { type SQL, and, desc, eq, sql } from "drizzle-orm";
import { db } from "../db";
import {
  leaguePlayers,
  leagueTeamPlayers,
  leagueTeams,
  leagues,
  matches,
  seasonTeams,
  seasons,
  teamMatches,
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
      seasonTeamId: teamMatches.seasonTeamId,
      matchDate: sql<string>`DATE(${teamMatches.createdAt})`.mapWith(String).as("match_date"),
      scoreBefore: teamMatches.scoreBefore,
      scoreAfter: teamMatches.scoreAfter,
      rnAsc:
        sql<number>`ROW_NUMBER() OVER (PARTITION BY ${teamMatches.seasonTeamId}, DATE(${teamMatches.createdAt}) ORDER BY ${teamMatches.createdAt}, ${teamMatches.id})`
          .mapWith(Number)
          .as("rn_asc"),
      rnDesc:
        sql<number>`ROW_NUMBER() OVER (PARTITION BY ${teamMatches.seasonTeamId}, DATE(${teamMatches.createdAt}) ORDER BY ${teamMatches.createdAt} DESC, ${teamMatches.id} DESC)`
          .mapWith(Number)
          .as("rn_desc"),
    })
    .from(teamMatches)
    .innerJoin(seasonTeams, eq(teamMatches.seasonTeamId, seasonTeams.id))
    .where(
      condition
        ? and(eq(seasonTeams.seasonId, seasonId), condition)
        : eq(seasonTeams.seasonId, seasonId),
    );
  const rankedMatches = db.$with("ranked_matches").as(subQuery);
  const firstMatchAlias = sql`${rankedMatches} "first_match"`;
  const firstMatch = subQuery.as("first_match");
  const lastMatchAlias = sql`${rankedMatches} "last_match"`;
  const lastMatch = subQuery.as("last_match");

  return db
    .with(rankedMatches)
    .select({
      seasonTeamId: seasonTeams.id,
      matchDate: sql`"first_match"."match_date"`.mapWith(String),
      pointDiff: sql<number>`${lastMatch.scoreAfter} - ${firstMatch.scoreBefore}`.mapWith(Number),
    })
    .from(firstMatchAlias)
    .innerJoin(
      lastMatchAlias,
      and(
        eq(firstMatch.seasonTeamId, lastMatch.seasonTeamId),
        eq(sql`"first_match"."match_date"`, sql`"last_match"."match_date"`),
        eq(sql`"first_match"."rn_asc"`, 1),
        eq(sql`"last_match"."rn_desc"`, 1),
      ),
    )
    .innerJoin(seasonTeams, eq(seasonTeams.id, firstMatch.seasonTeamId))
    .where(eq(seasonTeams.seasonId, seasonId))
    .groupBy(
      seasonTeams.id,
      lastMatch.scoreAfter,
      firstMatch.scoreBefore,
      sql`"first_match"."match_date"`,
    );
};

const matchesSubqueryBuilder = ({ seasonId }: { seasonId: string }) =>
  db
    .select({
      seasonTeamId: teamMatches.seasonTeamId,
      matchId: teamMatches.matchId,
      result: teamMatches.result,
      createdAt: teamMatches.createdAt,
      rowNumber:
        sql`ROW_NUMBER() OVER (PARTITION BY ${teamMatches.seasonTeamId} ORDER BY ${teamMatches.createdAt} DESC)`.as(
          "rowNumber",
        ),
    })
    .from(teamMatches)
    .innerJoin(matches, eq(matches.id, teamMatches.matchId))
    .innerJoin(seasonTeams, eq(seasonTeams.id, teamMatches.seasonTeamId))
    .where(eq(seasonTeams.seasonId, seasonId))
    .as("recent_matches");

const getStanding = async ({ seasonId }: { seasonId: string }) => {
  const matchesSubquery = matchesSubqueryBuilder({ seasonId });

  const teamStats = await db
    .select({
      seasonTeamId: matchesSubquery.seasonTeamId,
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
    .groupBy(matchesSubquery.seasonTeamId);
  const teams = await db
    .select({
      name: leagueTeams.name,
      seasonTeamId: seasonTeams.id,
      score: seasonTeams.score,
    })
    .from(seasonTeams)
    .innerJoin(leagueTeams, eq(leagueTeams.id, seasonTeams.teamId))
    .where(eq(seasonTeams.seasonId, seasonId))
    .orderBy(desc(seasonTeams.score));

  const pointDiff = await getPointDiffProgression({
    seasonId,
    condition: eq(sql`DATE(${teamMatches.createdAt})`, sql`CURRENT_DATE`),
  });

  return teams.map((p) => {
    const stats = teamStats.find((ps) => ps.seasonTeamId === p.seasonTeamId);
    const form = (stats?.recentResults as string)?.split(",")?.slice(0, 5) ?? [];

    return {
      seasonTeamId: p.seasonTeamId,
      name: p.name,
      score: p.score,
      matchCount: stats?.totalGames ?? 0,
      winCount: stats?.wins ?? 0,
      lossCount: stats?.losses ?? 0,
      drawCount: stats?.draws ?? 0,
      form: (form as ("W" | "D" | "L")[]).reverse(),
      pointDiff: pointDiff.find((pd) => pd.seasonTeamId === p.seasonTeamId)?.pointDiff ?? 0,
    };
  });
};

const getTopTeam = async ({ seasonSlug }: { seasonSlug: string }) => {
  const topTeamSubquery = db
    .select({
      seasonTeamId: seasonTeams.id,
      maxScore: seasonTeams.score,
    })
    .from(seasonTeams)
    .innerJoin(seasons, and(eq(seasons.id, seasonTeams.seasonId), eq(seasons.slug, seasonSlug)))
    .orderBy(desc(seasonTeams.score))
    .limit(1)
    .as("top_team");

  return db
    .select({
      seasonTeamId: seasonTeams.id,
      id: users.id,
      teamName: leagueTeams.name,
      name: users.name,
      imageUrl: users.imageUrl,
      score: seasonTeams.score,
    })
    .from(seasonTeams)
    .innerJoin(topTeamSubquery, eq(topTeamSubquery.seasonTeamId, seasonTeams.id))
    .innerJoin(seasons, and(eq(seasons.id, seasonTeams.seasonId), eq(seasons.slug, seasonSlug)))
    .innerJoin(leagues, eq(seasons.leagueId, leagues.id))
    .innerJoin(leagueTeams, eq(leagueTeams.id, seasonTeams.teamId))
    .innerJoin(leagueTeamPlayers, eq(leagueTeamPlayers.teamId, leagueTeams.id))
    .innerJoin(leaguePlayers, eq(leaguePlayers.id, leagueTeamPlayers.leaguePlayerId))
    .innerJoin(users, eq(users.id, leaguePlayers.userId));
};

export const SeasonTeamRepository = {
  getStanding,
  getTopTeam,
};
