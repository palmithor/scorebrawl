import { LeagueRepository } from "@scorebrawl/db";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { LeagueInputDTOSchema } from "@scorebrawl/api/src/league";
import { LeagueInputSchema } from "@scorebrawl/model";

export const leagueRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({ search: z.string().optional() }))
    .query(({ ctx, input: { search } }) =>
      LeagueRepository.getUserLeagues({ userId: ctx.auth.userId, search }),
    ),
  create: protectedProcedure
    .input(LeagueInputDTOSchema)
    .mutation(({ input }) => LeagueRepository.createLeague(LeagueInputSchema.parse(input))),
});
