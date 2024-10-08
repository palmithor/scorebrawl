import { z } from "zod";

import {
  createTRPCRouter,
  leagueEditorProcedure,
  leagueProcedure,
  seasonProcedure,
} from "@/server/api/trpc";
import { SeasonCreateDTO, SeasonEditDTOSchema } from "@scorebrawl/api";
import {
  create,
  findActive,
  findOverlappingSeason,
  getAll,
  getBySlug,
  getCountInfo,
  update,
} from "@scorebrawl/db/season";
import { SeasonCreateSchema, SeasonEditSchema } from "@scorebrawl/model";
import { TRPCError } from "@trpc/server";

const validateStartBeforeEnd = ({
  startDate,
  endDate,
}: {
  startDate?: Date;
  endDate?: Date;
}) => {
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
}: {
  leagueId: string;
  startDate?: Date;
  endDate?: Date;
}) => {
  if (!startDate) {
    return;
  }
  const overlappingSeason = await findOverlappingSeason({
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
  getBySlug: seasonProcedure
    .input(z.object({ leagueSlug: z.string(), seasonSlug: z.string() }))
    .query(({ ctx: { season } }) => season),
  getCountInfo: seasonProcedure
    .input(z.object({ leagueSlug: z.string(), seasonSlug: z.string() }))
    .query(async ({ input: { seasonSlug } }) => getCountInfo({ seasonSlug })),
  findActive: leagueProcedure
    .input(z.object({ leagueSlug: z.string() }))
    .query(async ({ ctx }) => findActive({ leagueId: ctx.league.id })),
  findBySlug: seasonProcedure
    .input(z.object({ leagueSlug: z.string(), seasonSlug: z.string() }))
    .query(async ({ ctx: { season } }) => season),
  getAll: leagueProcedure
    .input(z.object({ leagueSlug: z.string() }))
    .query(async ({ ctx }) => getAll({ leagueId: ctx.league.id })),
  create: leagueEditorProcedure.input(SeasonCreateDTO).mutation(async ({ input, ctx }) => {
    validateStartBeforeEnd(input);
    await validateNoOverlappingSeason({ ...input, leagueId: ctx.league.id });
    return create(
      SeasonCreateSchema.parse({
        userId: ctx.auth.userId,
        leagueId: ctx.league.id,
        ...input,
      }),
    );
  }),
  edit: leagueEditorProcedure.input(SeasonEditDTOSchema).mutation(async ({ ctx, input }) => {
    validateStartBeforeEnd(input);
    await validateNoOverlappingSeason({ ...input, leagueId: ctx.league.id });
    const season = await getBySlug({
      seasonSlug: input.seasonSlug,
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
    const updatedSeason = await update(
      SeasonEditSchema.parse({
        leagueId: ctx.league.id,
        userId: ctx.auth.userId,
        ...input,
      }),
    );
    if (!updatedSeason) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Season not found",
      });
    }
    return updatedSeason;
  }),
});
