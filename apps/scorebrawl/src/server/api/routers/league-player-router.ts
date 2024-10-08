import { z } from "zod";

import { createTRPCRouter, leagueProcedure } from "@/server/api/trpc";
import { LeaguePlayerDTO } from "@scorebrawl/api";
import { getAll } from "@scorebrawl/db/league-player";

export const leaguePlayerRouter = createTRPCRouter({
  getAll: leagueProcedure
    .input(z.object({ leagueSlug: z.string() }))
    .query(async ({ ctx: { league } }) => {
      const players = await getAll({ leagueId: league.id });
      return z.array(LeaguePlayerDTO).parse(players);
    }),
});
