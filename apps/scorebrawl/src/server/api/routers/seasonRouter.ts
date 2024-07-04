import { SeasonRepository } from "@scorebrawl/db";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const seasonRouter = createTRPCRouter({
  getTopPlayer: protectedProcedure
    .input(z.object({ seasonId: z.string() }))
    .query(({ input, ctx }) =>
      SeasonRepository.getSeasonTopPlayer({ seasonId: input.seasonId, userId: ctx.auth.userId }),
    ),
  getTopTeam: protectedProcedure
    .input(z.object({ seasonId: z.string() }))
    .query(({ input, ctx }) =>
      SeasonRepository.getSeasonTopTeam({ seasonId: input.seasonId, userId: ctx.auth.userId }),
    ),
});
