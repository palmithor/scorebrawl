import { and, count, desc, eq } from "drizzle-orm";
import { db } from "../db";
import { notifications } from "../schema";
import { createCuid } from "../utils";

export const createNotification = async (
  value: Omit<typeof notifications.$inferInsert, "id">
) => {
  const now = new Date();
  const [result] = await db
    .insert(notifications)
    .values({ id: createCuid(), ...value, updatedAt: now })
    .onConflictDoNothing()
    .returning();

  return result?.updatedAt === now;
};

export const findAll = async ({ userId }: { userId: string }) => {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));
};

export const getUnreadCount = async ({ userId }: { userId: string }) => {
  const [result] = await db
    .select({ count: count() })
    .from(notifications)
    .where(
      and(eq(notifications.userId, userId), eq(notifications.read, false))
    );
  return result?.count ?? 0;
};

export const markAsRead = async ({
  notificationId,
  userId,
}: {
  notificationId: string;
  userId: string;
}) =>
  db
    .update(notifications)
    .set({ read: true })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      )
    );

export const markAllAsRead = async ({ userId }: { userId: string }) =>
  db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.userId, userId));
