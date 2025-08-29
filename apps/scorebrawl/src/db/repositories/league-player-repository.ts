import { db } from "@/db";
import { eq, inArray } from "drizzle-orm";
import { LeaguePlayers, SeasonPlayers, Users } from "../schema";

export const getAll = async ({ leagueId }: { leagueId: string }) => {
  const result = await db
    .select({
      leaguePlayerId: LeaguePlayers.id,
      joinedAt: LeaguePlayers.createdAt,
      disabled: LeaguePlayers.disabled,
      userId: Users.id,
      name: Users.name,
      image: Users.image,
    })
    .from(LeaguePlayers)
    .innerJoin(Users, eq(LeaguePlayers.userId, Users.id))
    .where(eq(LeaguePlayers.leagueId, leagueId));

  return result.map((lp) => ({
    leaguePlayerId: lp.leaguePlayerId,
    disabled: lp.disabled,
    joinedAt: lp.joinedAt,
    user: { userId: lp.userId, name: lp.name, image: lp.image ?? undefined },
  }));
};

export const findLeaguePlayerIds = (seasonPlayerIds: string[]) =>
  db
    .select({
      leaguePlayerId: SeasonPlayers.leaguePlayerId,
      seasonPlayerId: SeasonPlayers.id,
      userId: LeaguePlayers.userId,
    })
    .from(SeasonPlayers)
    .innerJoin(LeaguePlayers, eq(LeaguePlayers.id, SeasonPlayers.leaguePlayerId))
    .where(inArray(SeasonPlayers.id, seasonPlayerIds));
