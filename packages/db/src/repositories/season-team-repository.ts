import { and, desc, eq, sql } from "drizzle-orm";
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

const matchesSubqueryBuilder = ({ seasonSlug }: { seasonSlug: string }) =>
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
    .innerJoin(seasons, and(eq(seasons.slug, seasonSlug), eq(seasonTeams.seasonId, seasons.id)))
    .as("recent_matches");

const getStanding = async ({ seasonSlug }: { seasonSlug: string }) => {
  const matchesSubquery = matchesSubqueryBuilder({ seasonSlug });

  // New subquery to calculate point difference for the current day
  const pointDiffSubquery = db
    .select({
      seasonTeamId: teamMatches.seasonTeamId,
      pointDiff: sql<number>`MAX(${teamMatches.scoreAfter}) - MIN(${teamMatches.scoreBefore})`.as(
        "pointDiff",
      ),
    })
    .from(teamMatches)
    .innerJoin(matches, eq(matches.id, teamMatches.matchId))
    .innerJoin(seasons, eq(seasons.id, matches.seasonId))
    .where(and(eq(seasons.slug, seasonSlug), sql`DATE(${matches.createdAt}) = CURRENT_DATE`))
    .groupBy(teamMatches.seasonTeamId)
    .as("point_diff");

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
      pointDiff: pointDiffSubquery.pointDiff,
    })
    .from(seasonTeams)
    .innerJoin(seasons, and(eq(seasons.id, seasonTeams.seasonId), eq(seasons.slug, seasonSlug)))
    .innerJoin(leagueTeams, eq(leagueTeams.id, seasonTeams.teamId))
    .leftJoin(pointDiffSubquery, eq(pointDiffSubquery.seasonTeamId, seasonTeams.id))
    .orderBy(desc(seasonTeams.score));

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
      pointDiff: p.pointDiff ?? 0, // Add this line to include the point difference
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
