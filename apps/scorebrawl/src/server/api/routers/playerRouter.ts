import { SeasonRepository } from "@scorebrawl/db";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const playerRouter = createTRPCRouter({
  getTopPlayer: protectedProcedure
    .input(z.object({ seasonId: z.string() }))
    .query(({ ctx, input: { seasonId } }) =>
      SeasonRepository.getSeasonTopPlayer({ seasonId, userId: ctx.auth.userId }),
    ),
});
