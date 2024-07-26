import type { LeaguePlayer } from "@scorebrawl/model";
import { eq } from "drizzle-orm";
import type z from "zod";
import { db } from "../db";
import { leaguePlayers, users } from "../schema";

const getAll = async ({ leagueId }: { leagueId: string }) => {
  const result = await db
    .select({
      leaguePlayerId: leaguePlayers.id,
      joinedAt: leaguePlayers.createdAt,
      disabled: leaguePlayers.disabled,
      userId: users.id,
      name: users.name,
      imageUrl: users.imageUrl,
    })
    .from(leaguePlayers)
    .innerJoin(users, eq(leaguePlayers.userId, users.id))
    .where(eq(leaguePlayers.leagueId, leagueId));

  return result.map((lp) => ({
    leaguePlayerId: lp.leaguePlayerId,
    disabled: lp.disabled,
    joinedAt: lp.joinedAt,
    user: { userId: lp.userId, name: lp.name, imageUrl: lp.imageUrl },
  })) satisfies z.infer<typeof LeaguePlayer>[];
};

export const LeaguePlayerRepository = {
  getAll,
};
