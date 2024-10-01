import { db } from "../db";
import { leaguePlayerAchievement } from "../schema";
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
