import { getSeasonTopPlayer, getSeasonTopTeam } from "@scorebrawl/db";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const seasonRouter = createTRPCRouter({
  getTopPlayer: protectedProcedure
    .input(z.object({ seasonId: z.string() }))
    .query(({ input, ctx }) =>
      getSeasonTopPlayer({ seasonId: input.seasonId, userId: ctx.auth.userId }),
    ),
  getTopTeam: protectedProcedure
    .input(z.object({ seasonId: z.string() }))
    .query(({ input, ctx }) =>
      getSeasonTopTeam({ seasonId: input.seasonId, userId: ctx.auth.userId }),
    ),
});
