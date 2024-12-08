import { z } from "zod";

import { createTRPCRouter, seasonProcedure } from "@/server/api/trpc";
import type { achievementCalculationTask } from "@/trigger/achievement-calculation-task";
import { MatchDTO, MatchInputDTO, RemoveMatchDTO } from "@scorebrawl/api";
import { create, findLatest, getBySeasonId, remove } from "@scorebrawl/db/match";
import { MatchInput } from "@scorebrawl/model";
import { tasks } from "@trigger.dev/sdk/v3";

export const matchRouter = createTRPCRouter({
  create: seasonProcedure.input(MatchInputDTO).mutation(async ({ ctx, input }) => {
    const match = await create(
      MatchInput.parse({
        userId: ctx.auth.user.id,
        seasonId: ctx.season.id,
        leagueId: ctx.league.id,
        ...input,
      }),
    );
    tasks.trigger<typeof achievementCalculationTask>("achivement-calculations", {
      seasonPlayerIds: [...match.awayTeamSeasonPlayerIds, ...match.homeTeamSeasonPlayerIds],
    });
    return MatchDTO.parse(match);
  }),
  remove: seasonProcedure.input(RemoveMatchDTO).mutation(async ({ ctx, input: { matchId } }) => {
    const seasonPlayerIds = await remove({
      matchId,
      seasonId: ctx.season.id,
    });
    tasks.trigger<typeof achievementCalculationTask>("achivement-calculations", {
      seasonPlayerIds,
    });
    return { success: true };
  }),
  getLatest: seasonProcedure
    .input(z.object({ leagueSlug: z.string(), seasonSlug: z.string() }))
    .query(async ({ ctx }) => {
      const latestMatch = await findLatest({
        seasonId: ctx.season.id,
      });
      return latestMatch ? MatchDTO.parse(latestMatch) : null;
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
      const matchPage = await getBySeasonId({
        seasonId: ctx.season.id,
        page,
        limit,
      });
      return matchPage; // todo create schema and parse
    }),
});
