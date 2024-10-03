import { and, eq, getTableColumns } from "drizzle-orm";
import { db } from "../db";
import { leaguePlayerAchievement, leaguePlayers } from "../schema";
import { createCuid } from "../utils";

export const createAchievement = async (
  value: Omit<typeof leaguePlayerAchievement.$inferInsert, "id">,
) => {
  const now = new Date();
  const [result] = await db
    .insert(leaguePlayerAchievement)
    .values({ id: createCuid(), ...value, updatedAt: now })
    .onConflictDoNothing()
    .returning();

  return result?.updatedAt === now;
};

export const getAchievements = async ({
  leaguePlayerId,
  leagueId,
}: { leaguePlayerId: string; leagueId: string }) =>
  db
    .select(getTableColumns(leaguePlayerAchievement))
    .from(leaguePlayerAchievement)
    .innerJoin(leaguePlayers, eq(leaguePlayerAchievement.leaguePlayerId, leaguePlayers.id))
    .where(
      and(
        eq(leaguePlayerAchievement.leaguePlayerId, leaguePlayerId),
        eq(leaguePlayers.leagueId, leagueId),
      ),
    );
