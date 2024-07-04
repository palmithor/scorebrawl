import {
  type LeagueMemberRole,
  createInvite,
  getLeagueInvites,
  leagueMemberRoles,
} from "@scorebrawl/db";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const inviteRouter = createTRPCRouter({
  getInvites: protectedProcedure
    .input(z.object({ leagueId: z.string() }))
    .query(({ input, ctx }) =>
      getLeagueInvites({ leagueId: input.leagueId, userId: ctx.auth.userId }),
    ),
  createInvite: protectedProcedure
    .input(z.object({ leagueId: z.string(), role: z.enum(leagueMemberRoles) }))
    .query(({ input, ctx }) =>
      createInvite({ leagueId: input.leagueId, userId: ctx.auth.userId, role: input.role }),
    ),
});
