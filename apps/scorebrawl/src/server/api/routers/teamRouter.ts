import { z } from "zod";

import { createTRPCRouter, leagueProcedure } from "@/server/api/trpc";
import { SeasonTeamRepository } from "@scorebrawl/db";

export const teamRouter = createTRPCRouter({
  getTop: leagueProcedure
    .input(z.object({ leagueSlug: z.string(), seasonSlug: z.string() }))
    .query(({ input: { seasonSlug } }) => SeasonTeamRepository.getTopTeam({ seasonSlug })),
});
