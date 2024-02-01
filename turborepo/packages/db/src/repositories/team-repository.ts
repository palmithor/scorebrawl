import { UpdateTeamInput } from "@scorebrawl/api";
import { asc, eq, inArray, sql } from "drizzle-orm";
import {
  DbTransaction,
  ScoreBrawlError,
  createCuid,
  getByIdWhereMember,
  leagueTeamPlayers,
  leagueTeams,
  seasonTeams,
} from "..";
import { db } from "../db";

export const getOrInsertTeam = async (
  tx: DbTransaction,
  {
    now,
    season,
    players,
  }: {
    now: Date;
    season: { id: string; initialElo: number; leagueId: string };
    players: { leaguePlayer: { id: string; user: { name: string } } }[];
  },
) => {
  const teamIdResult = await tx
    .select({ teamId: leagueTeamPlayers.teamId })
    .from(leagueTeamPlayers)
    .where(
      inArray(
        leagueTeamPlayers.leaguePlayerId,
        players.map((p) => p.leaguePlayer.id),
      ),
    )
    .groupBy(leagueTeamPlayers.teamId)
    .having(sql`COUNT(DISTINCT ${leagueTeamPlayers.leaguePlayerId}) = ${players.length}`)
    .get();

  let teamId = teamIdResult?.teamId;

  if (!teamId) {
    teamId = createCuid();
    await tx
      .insert(leagueTeams)
      .values({
        id: teamId,
        name: players.map((p) => p.leaguePlayer.user.name.split(" ")[0]).join(" & "),
        leagueId: season.leagueId,
        updatedAt: now,
        createdAt: now,
      })
      .run();

    await tx
      .insert(leagueTeamPlayers)
      .values(
        players.map((p) => ({
          id: createCuid(),
          teamId: teamId as string,
          leaguePlayerId: p.leaguePlayer.id,
          createdAt: now,
          updatedAt: now,
        })),
      )
      .run();

    const seasonTeamId = createCuid();
    await tx
      .insert(seasonTeams)
      .values({
        id: seasonTeamId,
        teamId: teamId,
        seasonId: season.id,
        elo: season.initialElo,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    return { seasonTeamId, elo: season.initialElo };
  }
  const seasonTeam = await tx.query.seasonTeams.findFirst({
    columns: { id: true, elo: true },
    where: (st, { and, eq }) => and(eq(st.teamId, teamId as string), eq(st.seasonId, season.id)),
  });
  if (!seasonTeam) {
    const seasonTeamId = createCuid();
    await tx
      .insert(seasonTeams)
      .values({
        id: seasonTeamId,
        seasonId: season.id,
        teamId: teamId,
        elo: season.initialElo,
        createdAt: now,
        updatedAt: now,
      })
      .run();
    return { seasonTeamId, elo: season.initialElo };
  }
  return { seasonTeamId: seasonTeam.id, elo: seasonTeam.elo };
};

export const updateTeam = async ({ leagueId, userId, teamId, name }: UpdateTeamInput) => {
  const league = await getByIdWhereMember({
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
    .returning()
    .get();
};

export const getLeagueTeams = async ({ leagueId }: { leagueId: string }) => {
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
