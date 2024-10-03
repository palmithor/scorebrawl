import { z } from "zod";

import { createTRPCRouter, leagueProcedure } from "@/server/api/trpc";
import { getAchievements } from "@scorebrawl/db";

export const achievementRouter = createTRPCRouter({
  getUserAchievements: leagueProcedure
    .input(z.object({ leagueSlug: z.string(), leaguePlayerId: z.string() }))
    .query(({ ctx, input }) =>
      getAchievements({ leagueId: ctx.league.id, leaguePlayerId: input.leaguePlayerId }),
    ),
});
