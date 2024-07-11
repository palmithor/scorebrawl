import { inviteRouter } from "@/server/api/routers/inviteRouter";
import { leagueRouter } from "@/server/api/routers/leagueRouter";
import { matchRouter } from "@/server/api/routers/matchRouter";
import { memberRouter } from "@/server/api/routers/memberRouter";
import { playerRouter } from "@/server/api/routers/playerRouter";
import { seasonRouter } from "@/server/api/routers/seasonRouter";
import { teamRouter } from "@/server/api/routers/teamRouter";
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
  match: matchRouter,
  member: memberRouter,
  player: playerRouter,
  season: seasonRouter,
  team: teamRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
