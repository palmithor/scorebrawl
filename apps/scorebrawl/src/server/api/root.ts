import { inviteRouter } from "@/server/api/routers/inviteRouter";
import { leagueRouter } from "@/server/api/routers/leagueRouter";
import { seasonRouter } from "@/server/api/routers/seasonRouter";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  invite: inviteRouter,
  league: leagueRouter,
  season: seasonRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
