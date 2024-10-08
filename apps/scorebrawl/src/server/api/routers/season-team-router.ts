import { z } from "zod";

import { createTRPCRouter, seasonProcedure } from "@/server/api/trpc";
import { getStanding, getTopTeam } from "@scorebrawl/db/season-team";

export const seasonTeamRouter = createTRPCRouter({
  getStanding: seasonProcedure
    .input(z.object({ leagueSlug: z.string(), seasonSlug: z.string() }))
    .query(
      ({
        ctx: {
          season: { id },
        },
      }) => getStanding({ seasonId: id }),
    ),
  getTop: seasonProcedure
    .input(z.object({ leagueSlug: z.string(), seasonSlug: z.string() }))
    .query(({ input: { seasonSlug } }) => getTopTeam({ seasonSlug })),
});
