import { createTRPCRouter } from "~/server/api/trpc";
import { leagueRouter } from "~/server/api/league/league.router";
import { seasonRouter } from "~/server/api/season/season.router";
import { matchRouter } from "./match/match.router";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  league: leagueRouter,
  season: seasonRouter,
  match: matchRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
