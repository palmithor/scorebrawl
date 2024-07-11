import { LeagueRepository } from "@scorebrawl/db";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const leagueRouter = createTRPCRouter({
  getLeagues: protectedProcedure
    .input(z.object({ search: z.string().optional() }))
    .query(({ ctx, input: { search } }) =>
      LeagueRepository.getUserLeagues({ userId: ctx.auth.userId, search }),
    ),
});
