import { SeasonRepository } from "@scorebrawl/db";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const teamRouter = createTRPCRouter({
  getTopTeam: protectedProcedure
    .input(z.object({ seasonId: z.string() }))
    .query(({ ctx, input: { seasonId } }) =>
      SeasonRepository.getSeasonTopTeam({ seasonId, userId: ctx.auth.userId }),
    ),
});
