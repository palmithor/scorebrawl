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
    .mutation(({ ctx, input: { matchId } }) =>
      MatchRepository.remove({ matchId, seasonId: ctx.season.id }),
    ),
  getLatest: seasonProcedure
    .input(z.object({ leagueSlug: z.string(), seasonSlug: z.string() }))
    .query(async ({ ctx }) => MatchRepository.findLatest({ seasonId: ctx.season.id })),
  getAll: seasonProcedure
    .input(
      z.object({
        leagueSlug: z.string(),
        seasonSlug: z.string(),
        limit: z.number().int().optional().default(30),
        page: z.number().int().optional().default(1),
      }),
    )
    .query(async ({ ctx, input: { page, limit } }) =>
      MatchRepository.getBySeasonId({ seasonId: ctx.season.id, page, limit }),
    ),
});
