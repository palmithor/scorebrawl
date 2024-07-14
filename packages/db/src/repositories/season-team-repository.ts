import { endOfDay, startOfDay } from "date-fns";
import { and, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { db } from "../db";
import {
  leaguePlayers,
  leagueTeamPlayers,
  leagueTeams,
  leagues,
  seasonTeams,
  seasons,
  teamMatches,
  users,
} from "../schema";
import { SeasonRepository } from "./season-repository";

const getTopTeam = async ({ seasonSlug }: { seasonSlug: string }) => {
  const result = await db
    .select({
      seasonTeamId: seasonTeams.id,
      id: users.id,
      teamName: leagueTeams.name,
      name: users.name,
      imageUrl: users.imageUrl,
    })
    .from(seasonTeams)
    .innerJoin(seasons, and(eq(seasons.id, seasonTeams.seasonId), eq(seasons.slug, seasonSlug)))
    .innerJoin(leagues, eq(seasons.leagueId, leagues.id))
    .innerJoin(leagueTeams, eq(leagueTeams.id, seasonTeams.teamId))
    .innerJoin(leagueTeamPlayers, eq(leagueTeamPlayers.teamId, leagueTeams.id))
    .innerJoin(leaguePlayers, eq(leaguePlayers.id, leagueTeamPlayers.leaguePlayerId))
    .innerJoin(users, eq(users.id, leaguePlayers.userId))
    .orderBy(desc(seasonTeams.score));

  const topTeamId = result[0]?.seasonTeamId;
  return topTeamId ? result.filter((r) => r.seasonTeamId === topTeamId) : [];
};

const getTeamsPointDiff = async ({
  seasonTeamIds,
  from = startOfDay(new Date()),
  to = endOfDay(new Date()),
}: { seasonTeamIds: string[]; from?: Date; to?: Date }) => {
  const result = await db.query.teamMatches.findMany({
    where: (matchPlayer, { and }) =>
      and(
        inArray(teamMatches.seasonTeamId, seasonTeamIds),
        gte(matchPlayer.createdAt, from),
        lte(matchPlayer.createdAt, to),
      ),
    orderBy: (matchPlayer, { asc }) => [asc(matchPlayer.createdAt)],
  });
  if (result.length === 0) {
    return [];
  }
  type MatchTeamType = (typeof result)[0];
  type SeasonTeamMatches = { seasonTeamId: string; matches: MatchTeamType[] };

  const seasonTeamMatches = result.reduce((acc: SeasonTeamMatches[], curr: MatchTeamType) => {
    const { seasonTeamId } = curr;
    const index = acc.findIndex((item: SeasonTeamMatches) => item.seasonTeamId === seasonTeamId);
    index !== -1 ? acc[index]?.matches.push(curr) : acc.push({ seasonTeamId, matches: [curr] });
    return acc;
  }, []);

  return seasonTeamMatches.map((spm) => ({
    seasonTeamId: spm.seasonTeamId,
    pointsDiff:
      (spm.matches[spm.matches.length - 1]?.scoreAfter ?? 0) - (spm.matches[0]?.scoreBefore ?? 0),
  }));
};

const getTeamsLatestMatches = async ({
  seasonTeamIds,
  limit = 5,
}: {
  seasonTeamIds: string[];
  limit?: number;
}) => {
  return db.query.seasonTeams.findMany({
    columns: { id: true },
    where: inArray(seasonTeams.id, seasonTeamIds),
    with: {
      season: { columns: { id: true } },
      matches: {
        orderBy: (match, { desc }) => [desc(match.createdAt)],
        limit,
      },
    },
  });
};

const getTeams = async ({
  leagueId,
  seasonId,
  userId,
}: {
  leagueId: string;
  seasonId: string;
  userId: string;
}) => {
  const season = await SeasonRepository.getById({ seasonId, userId, leagueId });
  const teams = await db.query.seasonTeams.findMany({
    extras: (_seasonTeam, { sql }) => ({
      matchCount:
        sql<number>`(SELECT COUNT(*) FROM season_team_match stm WHERE stm.season_team_id = "seasonTeams"."id")`.as(
          "matchCount",
        ),
      winCount:
        sql<number>`(SELECT COUNT(*) FROM season_team_match stm WHERE stm.season_team_id = "seasonTeams"."id" and result = 'W')`.as(
          "winCount",
        ),
      lossCount:
        sql<number>`(SELECT COUNT(*) FROM season_team_match stm WHERE stm.season_team_id = "seasonTeams"."id" and result = 'L')`.as(
          "lossCount",
        ),
      drawCount:
        sql<number>`(SELECT COUNT(*) FROM season_team_match stm WHERE stm.season_team_id = "seasonTeams"."id" and result = 'D')`.as(
          "drawCount",
        ),
    }),
    where: eq(seasonTeams.seasonId, season.id),
    columns: { id: true, score: true, createdAt: true, updatedAt: true },
    orderBy: desc(seasonTeams.score),
    with: {
      leagueTeam: {
        columns: { id: true, name: true },
        with: {
          players: {
            columns: { id: true },
            with: {
              leaguePlayer: {
                columns: { id: true },
                with: { user: { columns: { name: true, imageUrl: true } } },
              },
            },
          },
        },
      },
    },
  });
  return teams.map((team) => ({
    id: team.id,
    leagueTeamId: team.leagueTeam.id,
    name: team.leagueTeam.name,
    score: team.score,
    players: team.leagueTeam.players.map((p) => ({
      id: p.leaguePlayer.id,
      name: p.leaguePlayer.user.name,
      imageUrl: p.leaguePlayer.user.imageUrl,
    })),
    matchCount: team.matchCount,
    winCount: team.winCount,
    lossCount: team.lossCount,
    drawCount: team.drawCount,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
  }));
};

export const SeasonTeamRepository = {
  getTopTeam,
  getTeams,
  getTeamsPointDiff,
  getTeamsLatestMatches,
};
