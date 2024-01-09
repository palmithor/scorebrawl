import { eq } from "drizzle-orm";
import { db } from "../db";
import { leaguePlayers } from "../schema";

export const getLeaguePlayers = async ({ leagueId }: { leagueId: string }) => {
  const leaguePlayerResult = await db.query.leaguePlayers.findMany({
    columns: { id: true, createdAt: true, disabled: true, userId: true },
    where: eq(leaguePlayers.leagueId, leagueId),
    with: {
      user: {
        columns: { name: true, imageUrl: true },
      },
    },
  });

  return leaguePlayerResult.map((lp) => ({
    id: lp.id,
    userId: lp.userId,
    name: lp.user.name,
    imageUrl: lp.user.imageUrl,
    joinedAt: lp.createdAt,
    disabled: lp.disabled,
  }));
};
