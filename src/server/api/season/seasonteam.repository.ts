import { db } from "~/server/db";
import { leaguePlayers, matchPlayers, seasonPlayers, seasons } from "~/server/db/schema";
import { and, eq, type SQL, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import clerk from "@clerk/clerk-sdk-node";
import { fullName } from "~/lib/string-utils";

const getUniqueTeams = (teams: { seasonPlayerId: string; userId: string }[][]) => {
  const uq = new Set<string>();
  const result: { seasonPlayerId: string; userId: string }[][] = [];

  for (const team of teams) {
    const teamKey = [...team]
      .sort((a, b) => a.seasonPlayerId.localeCompare(b.seasonPlayerId))
      .map((p) => p.seasonPlayerId)
      .join(",");
    if (!uq.has(teamKey)) {
      uq.add(teamKey);
      result.push(team);
    }
  }
  return result;
};

export const getTeamScoresBySeasonId = async ({ seasonId }: { seasonId: string }) => {
  const seasonTeamsDbResult = await db
    .select({
      seasonPlayerIds: sql<string>`GROUP_CONCAT
        (DISTINCT season_player_id)`,
      userIds: sql<string>`GROUP_CONCAT
        (DISTINCT user_id)`,
    })
    .from(matchPlayers)
    .innerJoin(seasonPlayers, eq(seasonPlayers.id, matchPlayers.seasonPlayerId))
    .innerJoin(leaguePlayers, eq(leaguePlayers.id, seasonPlayers.leaguePlayerId))
    .innerJoin(seasons, eq(seasons.id, seasonPlayers.seasonId))
    .where(eq(seasons.id, seasonId))
    .groupBy(matchPlayers.matchId, matchPlayers.homeTeam)
    .all();

  const seasonTeams = seasonTeamsDbResult.map((val) => {
    const userIds = val.userIds.split(",");
    return val.seasonPlayerIds.split(",").map((spId, idx) => ({
      seasonPlayerId: spId,
      userId: userIds[idx] as string,
    }));
  });

  const uniqueTeams = getUniqueTeams(seasonTeams);

  const scoreResult = await Promise.all(
    uniqueTeams.map(async (team) => {
      const baseAlias = alias(matchPlayers, "mp0");

      // Create an object to store eloDiff sums
      const eloDiffSums: Record<string, SQL<number>> = {};
      team.forEach((player, idx) => {
        const mpAlias = idx === 0 ? baseAlias : alias(matchPlayers, `mp${idx}`);
        eloDiffSums[`eloDiff${idx}`] = sql`SUM(
            ${mpAlias.eloAfter}
            -
            ${mpAlias.eloBefore}
            )`;
      });

      // Build the query
      let query = db.select(eloDiffSums).from(baseAlias);

      const whereConditions = team.map((player, idx) => {
        const mpAlias = alias(matchPlayers, `mp${idx}`);
        return eq(mpAlias.seasonPlayerId, player.seasonPlayerId);
      });

      // Inner join with the remaining aliases
      for (let idx = 1; idx < team.length; idx++) {
        const mpAlias = alias(matchPlayers, `mp${idx}`);
        query = query.innerJoin(
          mpAlias,
          and(eq(baseAlias.matchId, mpAlias.matchId), eq(baseAlias.homeTeam, mpAlias.homeTeam)),
        );
      }
      const scores = (await query.where(and(...whereConditions)).get()) ?? {};
      return {
        team,
        score: Object.values<number>(scores).reduce((acc: number, curr: number) => acc + curr, 0),
      };
    }),
  );

  const userIds = new Set(uniqueTeams.flatMap((team) => team.map((p) => p.userId)));
  const clerkUsers = await clerk.users.getUserList({ limit: userIds.size, userId: [...userIds] });

  return scoreResult
    .map((teamScore) => {
      return {
        score: teamScore.score,
        team: teamScore.team.map((p) => {
          const user = clerkUsers.find((u) => u.id === p.userId);
          return {
            seasonPlayerId: p.seasonPlayerId,
            userId: user?.id || "",
            name: user ? fullName(user) : "",
            imageUrl: user?.imageUrl ?? "",
          };
        }),
      };
    })
    .sort((a, b) => (a.score > b.score ? -1 : 1));
};
