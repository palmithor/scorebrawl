import {
  findAll,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from "@scorebrawl/db/notification";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const notificationRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) =>
    findAll({ userId: ctx.auth.userId })
  ),
  unreadCount: protectedProcedure.query(async ({ ctx }) =>
    getUnreadCount({
      userId: ctx.auth.userId,
    })
  ),
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.string().min(1) }))
    .mutation(async ({ ctx, input: { notificationId } }) =>
      markAsRead({
        notificationId,
        userId: ctx.auth.userId,
      })
    ),
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) =>
    markAllAsRead({
      userId: ctx.auth.userId,
    })
  ),
});
