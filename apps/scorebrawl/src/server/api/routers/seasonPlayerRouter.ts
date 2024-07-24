import { z } from "zod";

import { createTRPCRouter, seasonProcedure } from "@/server/api/trpc";
import { SeasonPlayerDTO, SeasonPlayerStandingDTO } from "@scorebrawl/api";
import { SeasonPlayerRepository } from "@scorebrawl/db";

export const seasonPlayerRouter = createTRPCRouter({
  getAll: seasonProcedure
    .input(z.object({ seasonSlug: z.string(), leagueSlug: z.string() }))
    .query(async ({ input: { seasonSlug } }) => {
      const seasonPlayers = await SeasonPlayerRepository.getAll({ seasonSlug });
      return z.array(SeasonPlayerDTO).parse(seasonPlayers);
    }),
  getTop: seasonProcedure
    .input(z.object({ seasonSlug: z.string(), leagueSlug: z.string() }))
    .query(async ({ input: { seasonSlug } }) => {
      const player = await SeasonPlayerRepository.getTopPlayer({ seasonSlug });
      return SeasonPlayerDTO.optional().parse(player);
    }),
  getStruggling: seasonProcedure
    .input(z.object({ seasonSlug: z.string(), leagueSlug: z.string() }))
    .query(async ({ input: { seasonSlug } }) => {
      const player = await SeasonPlayerRepository.getStruggling({ seasonSlug });
      return SeasonPlayerStandingDTO.optional().parse(player);
    }),
  getOnFire: seasonProcedure
    .input(z.object({ seasonSlug: z.string(), leagueSlug: z.string() }))
    .query(async ({ input: { seasonSlug } }) => {
      const player = await SeasonPlayerRepository.getOnFire({ seasonSlug });
      return SeasonPlayerStandingDTO.optional().parse(player);
    }),
  getStanding: seasonProcedure
    .input(z.object({ seasonSlug: z.string(), leagueSlug: z.string() }))
    .query(async ({ input: { seasonSlug } }) => {
      const standing = await SeasonPlayerRepository.getStanding({ seasonSlug });
      return z.array(SeasonPlayerStandingDTO).parse(standing);
    }),
});
