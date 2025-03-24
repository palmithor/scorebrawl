import { createTRPCRouter, seasonProcedure } from "@/server/api/trpc";
import type { achievementCalculationTask } from "@/trigger/achievement-calculation-task";
import {
  EloMatchInputDTOSchema,
  FixtureMatchInputDTOSchema,
  MatchDTO,
  RemoveMatchDTO,
} from "@scorebrawl/api";
import { create, findById, findLatest, getBySeasonId, remove } from "@scorebrawl/db/match";
import { assignMatchToFixture, findFixtureById } from "@scorebrawl/db/season";
import { MatchInput } from "@scorebrawl/model";
import { tasks } from "@trigger.dev/sdk/v3";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const matchRouter = createTRPCRouter({
  createEloMatch: seasonProcedure.input(EloMatchInputDTOSchema).mutation(async ({ ctx, input }) => {
    if (ctx.season.scoreType !== "elo") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "This season does not support Elo matches",
      });
    }
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
  createFixtureMatch: seasonProcedure
    .input(FixtureMatchInputDTOSchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.season.scoreType !== "3-1-0") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This season does not support fixture matches",
        });
      }
      const fixture = await findFixtureById({
        seasonId: ctx.season.id,
        fixtureId: input.seasonFixtureId,
      });
      if (!fixture) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Fixture not found",
        });
      }
      if (fixture.matchId) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Match already registered",
        });
      }

      const match = await create(
        MatchInput.parse({
          userId: ctx.auth.user.id,
          seasonId: ctx.season.id,
          leagueId: ctx.league.id,
          homeTeamSeasonPlayerIds: [fixture.homePlayerId],
          awayTeamSeasonPlayerIds: [fixture.awayPlayerId],
          homeScore: input.homeScore,
          awayScore: input.awayScore,
        }),
      );
      await assignMatchToFixture({
        seasonId: ctx.season.id,
        fixtureId: fixture.id,
        matchId: match.id,
      });
      await tasks.trigger<typeof achievementCalculationTask>("achivement-calculations", {
        seasonPlayerIds: [...match.awayTeamSeasonPlayerIds, ...match.homeTeamSeasonPlayerIds],
      });
      return MatchDTO.parse(match);
    }),
  remove: seasonProcedure.input(RemoveMatchDTO).mutation(async ({ ctx, input }) => {
    const seasonPlayerIds = await remove({
      matchId: input.matchId,
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
  getById: seasonProcedure
    .input(z.object({ leagueSlug: z.string(), seasonSlug: z.string(), matchId: z.string() }))
    .query(async ({ ctx, input }) => {
      const match = await findById({
        seasonId: ctx.season.id,
        matchId: input.matchId,
      });
      return match ? MatchDTO.parse(match) : null;
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
