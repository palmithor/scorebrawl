import { SeasonRepository } from "@scorebrawl/db";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const playerRouter = createTRPCRouter({
  getTopPlayer: protectedProcedure
    .input(z.object({ seasonId: z.string() }))
    .query(({ input, ctx }) =>
      SeasonRepository.getSeasonTopPlayer({ seasonId: input.seasonId, userId: ctx.auth.userId }),
    ),
});
