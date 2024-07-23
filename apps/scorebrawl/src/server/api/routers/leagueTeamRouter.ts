import { createTRPCRouter, seasonProcedure } from "@/server/api/trpc";
import { LeagueTeamRepository } from "@scorebrawl/db";
import { z } from "zod";

export const leagueTeamRouter = createTRPCRouter({
  getBySeasonPlayerIds: seasonProcedure
    .input(
      z.object({
        leagueSlug: z.string(),
        seasonSlug: z.string(),
        seasonPlayerIds: z.array(z.string()),
      }),
    )
    .query(({ input: { seasonPlayerIds } }) =>
      LeagueTeamRepository.getBySeasonPlayerIds({ seasonPlayerIds }),
    ),
});
