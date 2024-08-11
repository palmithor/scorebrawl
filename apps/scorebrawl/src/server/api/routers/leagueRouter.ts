import { LeagueRepository } from "@scorebrawl/db";
import { z } from "zod";

import {
  createTRPCRouter,
  leagueEditorProcedure,
  leagueProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { editorRoles } from "@/utils/permissionUtil";
import { LeagueCreateDTO, LeagueEditDTO } from "@scorebrawl/api/src/league";
import { LeagueCreate, LeagueEdit } from "@scorebrawl/model";

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
    .input(LeagueCreateDTO)
    .mutation(({ ctx, input }) =>
      LeagueRepository.create(LeagueCreate.parse({ ...input, userId: ctx.auth.userId })),
    ),
  update: leagueEditorProcedure
    .input(LeagueEditDTO)
    .mutation(({ ctx: { league, auth }, input }) =>
      LeagueRepository.update(LeagueEdit.parse({ ...input, userId: auth.userId, id: league.id })),
    ),
});
