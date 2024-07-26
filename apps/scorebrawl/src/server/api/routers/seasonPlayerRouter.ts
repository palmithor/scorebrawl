import { z } from "zod";

import { createTRPCRouter, seasonProcedure } from "@/server/api/trpc";
import { SeasonPlayerDTO, SeasonPlayerStandingDTO } from "@scorebrawl/api";
import { SeasonPlayerRepository } from "@scorebrawl/db";

export const seasonPlayerRouter = createTRPCRouter({
  getAll: seasonProcedure
    .input(z.object({ seasonSlug: z.string(), leagueSlug: z.string() }))
    .query(async ({ ctx: { season } }) => {
      const seasonPlayers = await SeasonPlayerRepository.getAll({ seasonId: season.id });
      return z.array(SeasonPlayerDTO).parse(seasonPlayers);
    }),
  getTop: seasonProcedure
    .input(z.object({ seasonSlug: z.string(), leagueSlug: z.string() }))
    .query(async ({ ctx: { season } }) => {
      const player = await SeasonPlayerRepository.getTopPlayer({ seasonId: season.id });
      return SeasonPlayerDTO.optional().parse(player);
    }),
  getStruggling: seasonProcedure
    .input(z.object({ seasonSlug: z.string(), leagueSlug: z.string() }))
    .query(async ({ ctx: { season } }) => {
      const player = await SeasonPlayerRepository.getStruggling({ seasonId: season.id });
      return SeasonPlayerStandingDTO.optional().parse(player);
    }),
  getOnFire: seasonProcedure
    .input(z.object({ seasonSlug: z.string(), leagueSlug: z.string() }))
    .query(async ({ ctx: { season } }) => {
      const player = await SeasonPlayerRepository.getOnFire({ seasonId: season.id });
      return SeasonPlayerStandingDTO.optional().parse(player);
    }),
  getStanding: seasonProcedure
    .input(z.object({ seasonSlug: z.string(), leagueSlug: z.string() }))
    .query(async ({ ctx: { season } }) => {
      const standing = await SeasonPlayerRepository.getStanding({ seasonId: season.id });
      return z.array(SeasonPlayerStandingDTO).parse(standing);
    }),
});
