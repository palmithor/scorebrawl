import { InviteRepository, leagueMemberRoles } from "@scorebrawl/db";
import { z } from "zod";

import { createTRPCRouter, leagueProcedure, protectedProcedure } from "@/server/api/trpc";

export const inviteRouter = createTRPCRouter({
  getInvites: leagueProcedure
    .input(z.object({ leagueSlug: z.string() }))
    .query(({ ctx }) =>
      InviteRepository.getLeagueInvites({ leagueId: ctx.league.id, userId: ctx.auth.userId }),
    ),
  createInvite: leagueProcedure
    .input(z.object({ leagueSlug: z.string(), role: z.enum(leagueMemberRoles) }))
    .query(({ input, ctx }) =>
      InviteRepository.createInvite({
        leagueId: ctx.league.id,
        userId: ctx.auth.userId,
        role: input.role,
      }),
    ),
});
