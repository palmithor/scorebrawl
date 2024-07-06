import { inviteRouter } from "@/server/api/routers/inviteRouter";
import { leagueRouter } from "@/server/api/routers/leagueRouter";
import { memberRouter } from "@/server/api/routers/memberRouter";
import { seasonRouter } from "@/server/api/routers/seasonRouter";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { userRouter } from "./routers/userRouter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  invite: inviteRouter,
  league: leagueRouter,
  member: memberRouter,
  season: seasonRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
