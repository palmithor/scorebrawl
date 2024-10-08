import { z } from "zod";

import { createTRPCRouter, leagueEditorProcedure } from "@/server/api/trpc";
import { findAll } from "@scorebrawl/db/member";

export const memberRouter = createTRPCRouter({
  getAll: leagueEditorProcedure
    .input(z.object({ leagueSlug: z.string() }))
    .query(({ ctx }) => findAll({ leagueId: ctx.league.id })),
});
