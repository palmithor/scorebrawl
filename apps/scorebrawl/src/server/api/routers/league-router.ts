import { create, getUserLeagues, update } from "@scorebrawl/db/league";
import { z } from "zod";

import {
  createTRPCRouter,
  leagueEditorProcedure,
  leagueProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { editorRoles } from "@/utils/permission-util";
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
      getUserLeagues({
        userId: ctx.auth.user.id,
        search: input?.search,
      }),
    ),
  create: protectedProcedure
    .input(LeagueCreateDTO)
    .mutation(({ ctx, input }) =>
      create(LeagueCreate.parse({ ...input, userId: ctx.auth.user.id })),
    ),
  update: leagueEditorProcedure
    .input(LeagueEditDTO)
    .mutation(({ ctx: { league, auth }, input }) =>
      update(LeagueEdit.parse({ ...input, userId: auth.user.id, id: league.id })),
    ),
});
