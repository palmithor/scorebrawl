import { LeagueRepository } from "@scorebrawl/db";
import { z } from "zod";

import { createTRPCRouter, leagueProcedure, protectedProcedure } from "@/server/api/trpc";
import { editorRoles } from "@/utils/permissionUtil";
import { LeagueInputDTOSchema } from "@scorebrawl/api/src/league";
import { LeagueInput } from "@scorebrawl/model";

export const leagueRouter = createTRPCRouter({
  hasEditorAccess: leagueProcedure
    .input(z.object({ leagueSlug: z.string() }))
    .query(({ ctx }) => editorRoles.some((role) => ctx.role === role)),
  getLeagueBySlugAndRole: leagueProcedure
    .input(z.object({ leagueSlug: z.string() }))
    .query(({ ctx: { league, role } }) => ({
      ...league,
      role,
    })),
  getAll: protectedProcedure
    .input(z.object({ search: z.string().optional() }).optional())
    .query(({ ctx, input }) =>
      LeagueRepository.getUserLeagues({
        userId: ctx.auth.userId,
        search: input?.search,
      }),
    ),
  create: protectedProcedure
    .input(LeagueInputDTOSchema)
    .mutation(({ ctx, input }) =>
      LeagueRepository.createLeague(LeagueInput.parse({ ...input, userId: ctx.auth.userId })),
    ),
});
