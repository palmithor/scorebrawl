import { create, findByLeagueId } from "@scorebrawl/db/invite";
import { z } from "zod";

import { createTRPCRouter, leagueEditorProcedure } from "@/server/api/trpc";
import { InviteInputDTO } from "@scorebrawl/api";

export const inviteRouter = createTRPCRouter({
  getAll: leagueEditorProcedure.input(z.object({ leagueSlug: z.string() })).query(({ ctx }) =>
    findByLeagueId({
      leagueId: ctx.league.id,
    }),
  ),
  create: leagueEditorProcedure
    .input(InviteInputDTO)
    .mutation(({ input: { role, expiresAt }, ctx }) =>
      create({
        leagueId: ctx.league.id,
        userId: ctx.auth.user.id,
        role: role,
        expiresAt: expiresAt,
      }),
    ),
});
