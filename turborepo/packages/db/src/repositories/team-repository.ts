import { inArray, sql } from "drizzle-orm";
import { DbTransaction, createCuid, leagueTeamPlayers, leagueTeams, seasonTeams } from "..";

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
