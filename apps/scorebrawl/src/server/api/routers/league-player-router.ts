import { z } from "zod";

import { createTRPCRouter, leagueProcedure } from "@/server/api/trpc";
import { LeaguePlayerDTO } from "@scorebrawl/api";
import { LeaguePlayerRepository } from "@scorebrawl/db";

export const leaguePlayerRouter = createTRPCRouter({
  getAll: leagueProcedure
    .input(z.object({ leagueSlug: z.string() }))
    .query(async ({ ctx: { league } }) => {
      const players = await LeaguePlayerRepository.getAll({ leagueId: league.id });
      return z.array(LeaguePlayerDTO).parse(players);
    }),
});
