import { InviteRepository } from "@scorebrawl/db";
import { z } from "zod";

import { createTRPCRouter, leagueEditorProcedure } from "@/server/api/trpc";
import { createInviteSchema } from "@scorebrawl/api";

export const inviteRouter = createTRPCRouter({
  getAll: leagueEditorProcedure.input(z.object({ leagueSlug: z.string() })).query(({ ctx }) =>
    InviteRepository.getLeagueInvites({
      leagueId: ctx.leagueInfo.leagueId,
      userId: ctx.auth.userId,
    }),
  ),
  create: leagueEditorProcedure.input(createInviteSchema).mutation(({ input, ctx }) =>
    InviteRepository.createInvite({
      leagueId: ctx.leagueInfo.leagueId,
      userId: ctx.auth.userId,
      role: input.role,
      expiresAt: input.expiresAt,
    }),
  ),
});
