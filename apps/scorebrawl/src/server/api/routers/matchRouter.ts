import { z } from "zod";

import { createTRPCRouter, seasonProcedure } from "@/server/api/trpc";
import { MatchRepository } from "@scorebrawl/db";

export const matchRouter = createTRPCRouter({
  remove: seasonProcedure
    .input(
      z.object({
        leagueSlug: z.string(),
        seasonSlug: z.string(),
        matchId: z.string(),
      }),
    )
    .mutation(({ input }) => MatchRepository.remove(input)),
  getLatest: seasonProcedure
    .input(z.object({ leagueSlug: z.string(), seasonSlug: z.string() }))
    .query(async ({ ctx, input: { seasonSlug } }) =>
      MatchRepository.findLatest({ leagueId: ctx.league.id, seasonSlug }),
    ),
});
