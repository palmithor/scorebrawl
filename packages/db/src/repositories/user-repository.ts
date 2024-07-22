import { fullName } from "@scorebrawl/utils/string";
import { eq, inArray } from "drizzle-orm";
import { db } from "../db";
import {
  leaguePlayers,
  leagueTeamPlayers,
  leagueTeams,
  seasonPlayers,
  seasonTeams,
  users,
} from "../schema";

const getUserAvatar = async ({ userId }: { userId: string }) => {
  const [userAvatar] = await db
    .select({ name: users.name, imageUrl: users.imageUrl })
    .from(users)
    .where(eq(users.id, userId));
  return userAvatar;
};

const getSeasonTeamAvatars = async ({ seasonTeamIds }: { seasonTeamIds: string[] }) => {
  const rawResults = await db
    .select({
      teamId: seasonTeams.id,
      userId: users.id,
      imageUrl: users.imageUrl,
      name: users.name,
    })
    .from(leagueTeamPlayers)
    .innerJoin(leagueTeams, eq(leagueTeams.id, leagueTeamPlayers.teamId))
    .innerJoin(leaguePlayers, eq(leaguePlayers.id, leagueTeamPlayers.leaguePlayerId))
    .innerJoin(users, eq(users.id, leaguePlayers.userId))
    .innerJoin(seasonTeams, eq(seasonTeams.teamId, leagueTeams.id))
    .where(inArray(seasonTeams.id, seasonTeamIds));

  // Process the results to group players by team
  const resultMap = new Map<
    string,
    { teamId: string; players: { userId: string; imageUrl: string; name: string }[] }
  >();

  for (const row of rawResults) {
    if (!resultMap.has(row.teamId)) {
      resultMap.set(row.teamId, { teamId: row.teamId, players: [] });
    }
    resultMap.get(row.teamId)?.players.push({
      userId: row.userId,
      imageUrl: row.imageUrl,
      name: row.name,
    });
  }

  return Array.from(resultMap.values());
};

const getSeasonPlayerAvatars = ({ seasonPlayerIds }: { seasonPlayerIds: Array<string> }) => {
  return db
    .select({
      userId: users.id,
      imageUrl: users.imageUrl,
      name: users.name,
    })
    .from(seasonPlayers)
    .innerJoin(leaguePlayers, eq(leaguePlayers.id, seasonPlayers.leaguePlayerId))
    .innerJoin(users, eq(users.id, leaguePlayers.userId))
    .where(inArray(seasonPlayers.id, seasonPlayerIds));
};

const findUserById = async ({ id }: { id: string }) =>
  db.select().from(users).where(eq(users.id, id));

const setDefaultLeague = async ({ leagueId, userId }: { leagueId: string; userId: string }) => {
  const [user] = await db
    .update(users)
    .set({ defaultLeagueId: leagueId })
    .where(eq(users.id, userId))
    .returning();
  return user;
};

const upsertUser = async ({
  id,
  firstName,
  lastName,
  imageUrl,
  createdAt,
  updatedAt,
}: {
  id: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  createdAt: number;
  updatedAt: number;
}) => {
  await db
    .insert(users)
    .values({
      id,
      name: fullName({
        firstName,
        lastName,
      }),
      imageUrl: imageUrl,
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt),
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        name: fullName({
          firstName,
          lastName,
        }),
        imageUrl: imageUrl,
        updatedAt: new Date(updatedAt),
      },
    });
};

export const UserRepository = {
  findUserById,
  getUserAvatar,
  setDefaultLeague,
  upsertUser,
  getSeasonTeamAvatars,
  getSeasonPlayerAvatars,
};
