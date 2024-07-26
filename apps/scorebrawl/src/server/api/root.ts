import { avatarRouter } from "@/server/api/routers/avatarRouter";
import { inviteRouter } from "@/server/api/routers/inviteRouter";
import { leaguePlayerRouter } from "@/server/api/routers/leaguePlayerRouter";
import { leagueRouter } from "@/server/api/routers/leagueRouter";
import { leagueTeamRouter } from "@/server/api/routers/leagueTeamRouter";
import { matchRouter } from "@/server/api/routers/matchRouter";
import { memberRouter } from "@/server/api/routers/memberRouter";
import { seasonPlayerRouter } from "@/server/api/routers/seasonPlayerRouter";
import { seasonRouter } from "@/server/api/routers/seasonRouter";
import { seasonTeamRouter } from "@/server/api/routers/seasonTeamRouter";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { userRouter } from "./routers/userRouter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  avatar: avatarRouter,
  invite: inviteRouter,
  league: leagueRouter,
  match: matchRouter,
  member: memberRouter,
  leaguePlayer: leaguePlayerRouter,
  leagueTeam: leagueTeamRouter,
  seasonPlayer: seasonPlayerRouter,
  season: seasonRouter,
  seasonTeam: seasonTeamRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
