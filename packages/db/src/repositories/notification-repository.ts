import { createCuid } from "@scorebrawl/utils/id";
import { db } from "../db";
import { Notifications } from "../schema";

export const createNotification = async (value: Omit<typeof Notifications.$inferInsert, "id">) => {
  const now = new Date();
  const [result] = await db
    .insert(Notifications)
    .values({ id: createCuid(), ...value, updatedAt: now })
    .onConflictDoNothing()
    .returning();

  return result?.updatedAt === now;
};
