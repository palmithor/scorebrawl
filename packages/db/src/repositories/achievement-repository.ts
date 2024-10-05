import { and, eq, getTableColumns } from "drizzle-orm";
import { db } from "../db";
import { LeaguePlayerAchievement, LeaguePlayers } from "../schema";
import { createCuid } from "../utils";

export const createAchievement = async (
  value: Omit<typeof LeaguePlayerAchievement.$inferInsert, "id">,
) => {
  const now = new Date();
  const [result] = await db
    .insert(LeaguePlayerAchievement)
    .values({ id: createCuid(), ...value, updatedAt: now })
    .onConflictDoNothing()
    .returning();

  return result?.updatedAt === now;
};

export const getAchievements = async ({
  leaguePlayerId,
  leagueId,
}: {
  leaguePlayerId: string;
  leagueId: string;
}) =>
  db
    .select(getTableColumns(LeaguePlayerAchievement))
    .from(LeaguePlayerAchievement)
    .innerJoin(LeaguePlayers, eq(LeaguePlayerAchievement.leaguePlayerId, LeaguePlayers.id))
    .where(
      and(
        eq(LeaguePlayerAchievement.leaguePlayerId, leaguePlayerId),
        eq(LeaguePlayers.leagueId, leagueId),
      ),
    );
