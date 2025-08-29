import { z } from "zod";

import { getAll } from "@/db/repositories/league-player-repository";
import { LeaguePlayerDTO } from "@/dto";
import { createTRPCRouter, leagueProcedure } from "@/server/api/trpc";

export const leaguePlayerRouter = createTRPCRouter({
  getAll: leagueProcedure
    .input(z.object({ leagueSlug: z.string() }))
    .query(async ({ ctx: { league } }) => {
      const players = await getAll({ leagueId: league.id });
      return z.array(LeaguePlayerDTO).parse(players);
    }),
});
