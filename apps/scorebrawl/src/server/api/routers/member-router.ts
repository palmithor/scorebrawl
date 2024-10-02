import { z } from "zod";

import { createTRPCRouter, leagueEditorProcedure } from "@/server/api/trpc";
import { MemberRepository } from "@scorebrawl/db";

export const memberRouter = createTRPCRouter({
  getAll: leagueEditorProcedure
    .input(z.object({ leagueSlug: z.string() }))
    .query(({ ctx }) => MemberRepository.find({ leagueId: ctx.league.id })),
});
