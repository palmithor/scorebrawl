import { db } from "../db";
import { Notifications } from "../schema";
import { createCuid } from "../utils";

export const createNotification = async (value: Omit<typeof Notifications.$inferInsert, "id">) => {
  const now = new Date();
  const [result] = await db
    .insert(Notifications)
    .values({ id: createCuid(), ...value, updatedAt: now })
    .onConflictDoNothing()
    .returning();

  return result?.updatedAt === now;
};
