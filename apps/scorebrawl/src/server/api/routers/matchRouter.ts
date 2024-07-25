import { z } from "zod";

import { createTRPCRouter, seasonProcedure } from "@/server/api/trpc";
import { MatchDTO, MatchInputDTO, RemoveMatchDTO } from "@scorebrawl/api";
import { MatchRepository } from "@scorebrawl/db";
import { MatchInput } from "@scorebrawl/model";

export const matchRouter = createTRPCRouter({
  create: seasonProcedure.input(MatchInputDTO).mutation(async ({ ctx, input }) => {
    const match = await MatchRepository.create(
      MatchInput.parse({
        userId: ctx.auth.userId,
        seasonId: ctx.season.id,
        leagueId: ctx.league.id,
        ...input,
      }),
    );
    return MatchDTO.parse(match);
  }),
  remove: seasonProcedure
    .input(RemoveMatchDTO)
    .mutation(({ ctx, input: { matchId } }) =>
      MatchRepository.remove({ matchId, seasonId: ctx.season.id }),
    ),
  getLatest: seasonProcedure
    .input(z.object({ leagueSlug: z.string(), seasonSlug: z.string() }))
    .query(async ({ ctx }) => {
      const latestMatch = await MatchRepository.findLatest({
        seasonId: ctx.season.id,
      });
      return MatchDTO.parse(latestMatch);
    }),
  getAll: seasonProcedure
    .input(
      z.object({
        leagueSlug: z.string(),
        seasonSlug: z.string(),
        limit: z.number().int().optional().default(30),
        page: z.number().int().optional().default(1),
      }),
    )
    .query(async ({ ctx, input: { page, limit } }) => {
      const matchPage = await MatchRepository.getBySeasonId({
        seasonId: ctx.season.id,
        page,
        limit,
      });
      return matchPage; // todo create schema and parse
    }),
});
