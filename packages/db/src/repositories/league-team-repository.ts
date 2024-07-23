import type { UpdateTeamInput } from "@scorebrawl/api";
import { asc, eq, getTableColumns, inArray, sql } from "drizzle-orm";
import {
  LeagueRepository,
  ScoreBrawlError,
  createCuid,
  leagueTeamPlayers,
  leagueTeams,
  seasonPlayers,
  seasonTeams,
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

const updateTeam = async ({ leagueId, userId, teamId, name }: UpdateTeamInput) => {
  const league = await LeagueRepository.getByIdWhereMember({
    leagueId: leagueId,
    userId: userId,
    allowedRoles: ["owner", "editor"],
  });

  const team = await db.query.leagueTeams.findFirst({
    where: (team, { eq, and }) => and(eq(team.id, teamId), eq(team.leagueId, leagueId)),
    with: {
      players: {
        columns: { id: true },
        with: {
          leaguePlayer: {
            columns: { id: true },
            with: { user: { columns: { id: true } } },
          },
        },
      },
    },
  });
  if (!league && !team?.players.map((p) => p.leaguePlayer.user.id).includes(userId)) {
    throw new ScoreBrawlError({
      code: "FORBIDDEN",
      message: "You are not authorized to update this team",
    });
  }
  return db
    .update(leagueTeams)
    .set({
      name: name,
    })
    .where(eq(leagueTeams.id, teamId))
    .returning();
};

const getBySeasonPlayerIds = async ({ seasonPlayerIds }: { seasonPlayerIds: string[] }) => {
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
  updateTeam,
  getBySeasonPlayerIds,
};
