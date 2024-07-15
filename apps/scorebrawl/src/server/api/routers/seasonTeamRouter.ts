import { z } from "zod";

import { createTRPCRouter, seasonProcedure } from "@/server/api/trpc";
import { SeasonTeamRepository } from "@scorebrawl/db";

export const seasonTeamRouter = createTRPCRouter({
  getStanding: seasonProcedure
    .input(z.object({ leagueSlug: z.string(), seasonSlug: z.string() }))
    .query(({ input: { seasonSlug } }) => SeasonTeamRepository.getStanding({ seasonSlug })),
  getTop: seasonProcedure
    .input(z.object({ leagueSlug: z.string(), seasonSlug: z.string() }))
    .query(({ input: { seasonSlug } }) => SeasonTeamRepository.getTopTeam({ seasonSlug })),
});
