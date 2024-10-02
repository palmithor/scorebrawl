import { InviteRepository } from "@scorebrawl/db";
import { z } from "zod";

import { createTRPCRouter, leagueEditorProcedure } from "@/server/api/trpc";
import { InviteInputDTO } from "@scorebrawl/api";

export const inviteRouter = createTRPCRouter({
  getAll: leagueEditorProcedure.input(z.object({ leagueSlug: z.string() })).query(({ ctx }) =>
    InviteRepository.getLeagueInvites({
      leagueId: ctx.league.id,
    }),
  ),
  create: leagueEditorProcedure
    .input(InviteInputDTO)
    .mutation(({ input: { role, expiresAt }, ctx }) =>
      InviteRepository.createInvite({
        leagueId: ctx.league.id,
        userId: ctx.auth.userId,
        role: role,
        expiresAt: expiresAt,
      }),
    ),
});
