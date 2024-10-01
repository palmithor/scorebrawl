import { db } from "../db";
import { notifications } from "../schema";
import { createCuid } from "../utils";

export const createNotification = async (value: Omit<typeof notifications.$inferInsert, "id">) => {
  const now = new Date();
  const [result] = await db
    .insert(notifications)
    .values({ id: createCuid(), ...value, updatedAt: now })
    .onConflictDoNothing()
    .returning();

  return result?.updatedAt === now;
};
