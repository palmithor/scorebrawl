import { SeasonRepository } from "@scorebrawl/db";
import { z } from "zod";

import {
  createTRPCRouter,
  leagueEditorProcedure,
  leagueProcedure,
  seasonProcedure,
} from "@/server/api/trpc";
import { scoreType } from "@scorebrawl/api";
import { TRPCError } from "@trpc/server";

const validateStartBeforeEnd = ({ startDate, endDate }: { startDate?: Date; endDate?: Date }) => {
  if (endDate && startDate && startDate > endDate) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "End date must be after start date",
    });
  }
};
const validateNoOverlappingSeason = async ({
  leagueId,
  startDate,
  endDate,
}: { leagueId: string; startDate?: Date; endDate?: Date }) => {
  if (!startDate) {
    return;
  }
  const overlappingSeason = await SeasonRepository.findOverlappingSeason({
    leagueId,
    startDate,
    endDate,
  });
  if (overlappingSeason) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Season overlaps with existing season",
    });
  }
};

export const seasonRouter = createTRPCRouter({
  getCountInfo: seasonProcedure
    .input(z.object({ leagueSlug: z.string(), seasonSlug: z.string() }))
    .query(async ({ input: { seasonSlug } }) => SeasonRepository.getCountInfo({ seasonSlug })),
  findOngoing: leagueProcedure
    .input(z.object({ leagueSlug: z.string() }))
    .query(async ({ ctx }) => SeasonRepository.findOngoingSeason({ leagueId: ctx.league.id })),
  findBySlug: seasonProcedure
    .input(z.object({ leagueSlug: z.string(), seasonSlug: z.string() }))
    .query(async ({ ctx: { season } }) => season),
  getAll: leagueProcedure
    .input(z.object({ leagueSlug: z.string() }))
    .query(async ({ ctx }) => SeasonRepository.getAll({ leagueId: ctx.league.id })),
  create: leagueEditorProcedure
    .input(
      z
        .object({
          leagueSlug: z.string(),
          name: z.string(),
          startDate: z.date(),
          endDate: z.date().optional(),
          initialScore: z.number(),
          scoreType: z.enum(scoreType),
          kFactor: z.number().optional().default(32),
        })
        .refine((data) => {
          return (
            (data.scoreType === "elo" || data.scoreType === "elo-individual-vs-team") && {
              message: "Elo score type requires kFactor to be provided",
              path: ["scoreType", "kFactor"],
            }
          );
        }),
    )
    .mutation(async ({ input, ctx }) => {
      validateStartBeforeEnd(input);
      await validateNoOverlappingSeason({ ...input, leagueId: ctx.league.id });
      return SeasonRepository.create({
        userId: ctx.auth.userId,
        leagueId: ctx.league.id,
        ...input,
      });
    }),
  edit: leagueEditorProcedure
    .input(
      z
        .object({
          leagueSlug: z.string(),
          seasonId: z.string(),
          name: z.string().optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          initialScore: z.number().optional(),
          scoreType: z.enum(scoreType).optional(),
          kFactor: z.number().optional(),
        })
        .refine(
          (data) =>
            data.name !== undefined ||
            data.startDate !== undefined ||
            data.endDate !== undefined ||
            data.initialScore !== undefined ||
            data.scoreType !== undefined ||
            data.kFactor !== undefined,
          {
            message:
              "At least one of startDate, endDate, initialScore, or kFactor must be provided",
            path: ["name", "startDate", "endDate", "initialScore", "scoreType", "kFactor"], // This will mark all these fields as the source of the error
          },
        ),
    )
    .mutation(async ({ ctx, input }) => {
      validateStartBeforeEnd(input);
      await validateNoOverlappingSeason({ ...input, leagueId: ctx.league.id });
      const season = await SeasonRepository.getById({
        seasonId: input.seasonId,
        leagueId: ctx.league.id,
        userId: ctx.auth.userId,
      });
      if (
        season.startDate < new Date() &&
        (input.startDate !== undefined ||
          input.endDate !== undefined ||
          input.initialScore !== undefined ||
          input.scoreType !== undefined ||
          input.kFactor !== undefined)
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only update name of a season that has started",
        });
      }
      const updatedSeason = await SeasonRepository.update({
        leagueId: ctx.league.id,
        userId: ctx.auth.userId,
        ...input,
      });
      if (!updatedSeason) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Season not found",
        });
      }
      return updatedSeason;
    }),
});
