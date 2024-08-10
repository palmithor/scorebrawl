import type { LeagueTeamInput } from "@scorebrawl/model";
import { and, asc, eq, getTableColumns, inArray, sql } from "drizzle-orm";
import type { z } from "zod";
import {
  ScoreBrawlError,
  createCuid,
  leaguePlayers,
  leagueTeamPlayers,
  leagueTeams,
  leagues,
  seasonPlayers,
  seasonTeams,
  users,
} from "..";
import { db } from "../db";

const getLeagueTeams = async ({ leagueId }: { leagueId: string }) => {
  return db.query.leagueTeams.findMany({
    where: (team, { eq }) => eq(team.leagueId, leagueId),
    orderBy: asc(leagueTeams.name),
    with: {
      players: {
        columns: {},
        with: {
          leaguePlayer: {
            columns: { id: true },
            with: {
              user: {
                columns: { id: true, name: true, imageUrl: true },
              },
            },
          },
        },
      },
    },
  });
};

const getOrInsertTeam = async ({
  now,
  season,
  players,
}: {
  now: Date;
  season: { id: string; initialScore: number; leagueId: string };
  players: { leaguePlayer: { id: string; user: { name: string } } }[];
}) => {
  const [teamIdResult] = await db
    .select({ teamId: leagueTeamPlayers.teamId })
    .from(leagueTeamPlayers)
    .where(
      inArray(
        leagueTeamPlayers.leaguePlayerId,
        players.map((p) => p.leaguePlayer.id),
      ),
    )
    .groupBy(leagueTeamPlayers.teamId)
    .having(sql`COUNT(DISTINCT ${leagueTeamPlayers.leaguePlayerId}) = ${players.length}`);

  let teamId = teamIdResult?.teamId;

  if (!teamId) {
    teamId = createCuid();
    await db.insert(leagueTeams).values({
      id: teamId,
      name: players.map((p) => p.leaguePlayer.user.name.split(" ")[0]).join(" & "),
      leagueId: season.leagueId,
      updatedAt: now,
      createdAt: now,
    });

    await db.insert(leagueTeamPlayers).values(
      players.map((p) => ({
        id: createCuid(),
        teamId: teamId as string,
        leaguePlayerId: p.leaguePlayer.id,
        createdAt: now,
        updatedAt: now,
      })),
    );

    const seasonTeamId = createCuid();
    await db.insert(seasonTeams).values({
      id: seasonTeamId,
      teamId: teamId,
      seasonId: season.id,
      score: season.initialScore,
      createdAt: now,
      updatedAt: now,
    });

    return { seasonTeamId, score: season.initialScore };
  }
  const seasonTeam = await db.query.seasonTeams.findFirst({
    columns: { id: true, score: true },
    where: (st, { and, eq }) => and(eq(st.teamId, teamId as string), eq(st.seasonId, season.id)),
  });
  if (!seasonTeam) {
    const seasonTeamId = createCuid();
    await db.insert(seasonTeams).values({
      id: seasonTeamId,
      seasonId: season.id,
      teamId: teamId,
      score: season.initialScore,
      createdAt: now,
      updatedAt: now,
    });
    return { seasonTeamId, score: season.initialScore };
  }
  return { seasonTeamId: seasonTeam.id, score: seasonTeam.score };
};

const update = async ({
  leagueSlug,
  teamId,
  name,
  userId,
  isEditor,
}: z.infer<typeof LeagueTeamInput>) => {
  console.log("1");
  const [leagueTeam] = await db
    .select({ id: leagueTeams.id })
    .from(leagueTeams)
    .innerJoin(leagues, eq(leagues.id, leagueTeams.leagueId))
    .where(and(eq(leagueTeams.id, teamId), eq(leagues.slug, leagueSlug)));
  if (!leagueTeam) {
    throw new ScoreBrawlError({
      code: "NOT_FOUND",
      message: "Team not found in league",
    });
  }
  console.log("1");
  if (!isEditor) {
    const [result] = await db
      .select({ id: leagueTeams.id })
      .from(leagueTeams)
      .innerJoin(leagues, eq(leagues.id, leagueTeams.leagueId))
      .innerJoin(leagueTeamPlayers, eq(leagueTeamPlayers.teamId, leagueTeams.id))
      .innerJoin(leaguePlayers, eq(leaguePlayers.id, leagueTeamPlayers.leaguePlayerId))
      .innerJoin(users, eq(users.id, leaguePlayers.userId))
      .where(and(eq(leagues.slug, leagueSlug), eq(leagueTeams.id, teamId), eq(users.id, userId)));
    if (!result) {
      throw new ScoreBrawlError({
        code: "FORBIDDEN",
        message: "User is not authorized to update team",
      });
    }
  }
  return db
    .update(leagueTeams)
    .set({
      name: name,
      updatedAt: new Date(),
    })
    .where(and(eq(leagueTeams.id, teamId)))
    .returning();
};

const getBySeasonPlayerIds = async ({
  seasonPlayerIds,
}: {
  seasonPlayerIds: string[];
}) => {
  const [team] = await db
    .select(getTableColumns(leagueTeams))
    .from(leagueTeamPlayers)
    .innerJoin(leagueTeams, eq(leagueTeams.id, leagueTeamPlayers.teamId))
    .innerJoin(seasonTeams, eq(seasonTeams.teamId, leagueTeams.id))
    .innerJoin(seasonPlayers, eq(seasonPlayers.seasonId, seasonTeams.seasonId))
    .where(inArray(seasonPlayers.id, seasonPlayerIds));
  return team;
};

export const LeagueTeamRepository = {
  getLeagueTeams,
  getOrInsertTeam,
  update,
  getBySeasonPlayerIds,
};
