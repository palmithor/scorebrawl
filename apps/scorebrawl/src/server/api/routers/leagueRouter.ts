import { LeagueRepository } from "@scorebrawl/db";
import { z } from "zod";

import { createTRPCRouter, leagueProcedure, protectedProcedure } from "@/server/api/trpc";
import { editorRoles } from "@/utils/permissionUtil";
import { LeagueInputDTOSchema } from "@scorebrawl/api/src/league";
import { LeagueInputSchema } from "@scorebrawl/model";

export const leagueRouter = createTRPCRouter({
  hasEditorAccess: leagueProcedure
    .input(z.object({ leagueSlug: z.string() }))
    .query(({ ctx }) => editorRoles.some((role) => ctx.role === role)),
  getAll: protectedProcedure
    .input(z.object({ search: z.string().optional() }))
    .query(({ ctx, input: { search } }) =>
      LeagueRepository.getUserLeagues({ userId: ctx.auth.userId, search }),
    ),
  create: protectedProcedure
    .input(LeagueInputDTOSchema)
    .mutation(({ ctx, input }) =>
      LeagueRepository.createLeague(LeagueInputSchema.parse({ ...input, userId: ctx.auth.userId })),
    ),
});
