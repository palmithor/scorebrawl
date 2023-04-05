import { createTRPCRouter } from "~/server/api/trpc";
import { leagueRouter } from "~/server/api/league/router";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  league: leagueRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
