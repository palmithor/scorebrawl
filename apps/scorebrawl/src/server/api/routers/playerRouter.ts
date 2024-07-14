import { z } from "zod";

import { createTRPCRouter, leagueProcedure } from "@/server/api/trpc";
import { SeasonPlayerRepository } from "@scorebrawl/db";

export const playerRouter = createTRPCRouter({
  getTop: leagueProcedure
    .input(z.object({ seasonSlug: z.string(), leagueSlug: z.string() }))
    .query(({ input: { seasonSlug } }) => SeasonPlayerRepository.getTopPlayer({ seasonSlug })),
  getStruggling: leagueProcedure
    .input(z.object({ seasonSlug: z.string(), leagueSlug: z.string() }))
    .query(({ input: { seasonSlug } }) => SeasonPlayerRepository.getStruggling({ seasonSlug })),
  getOnFire: leagueProcedure
    .input(z.object({ seasonSlug: z.string(), leagueSlug: z.string() }))
    .query(({ input: { seasonSlug } }) => SeasonPlayerRepository.getOnFire({ seasonSlug })),
});
