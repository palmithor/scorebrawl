"use server";

import type { AppRouter } from "@/server/api/root";
import { api } from "@/trpc/server";
import { auth } from "@clerk/nextjs/server";
import { PlayerRepository, SeasonRepository } from "@scorebrawl/db";
import type { SeasonPlayer } from "@scorebrawl/db/types";
import type { inferRouterInputs } from "@trpc/server";
import { cache } from "react";

export const getPlayers = cache(async (seasonId: string, leagueId: string) =>
  SeasonRepository.getSeasonPlayers({ leagueId, seasonId, userId: auth().userId as string }),
);

export const getPlayerPointDiff = cache((seasonPlayerIds: string[]) =>
  PlayerRepository.getSeasonPlayersPointDiff({ seasonPlayerIds }),
);

export const getPlayersForm = cache(
  async ({ seasonPlayers }: { seasonPlayers: SeasonPlayer[] }) => {
    const latestMatches = await SeasonRepository.getSeasonPlayerLatestMatches({
      seasonPlayerIds: seasonPlayers.map((sp) => sp.id),
    });
    return seasonPlayers.map((sp) => {
      const matches = latestMatches.find((lm) => lm.id === sp.id)?.matches || [];
      const formScore = matches
        .map((m) => m.result)
        .reduce((sum, result) => sum + (result === "W" ? 3 : result === "D" ? 1 : 0), 0);
      return { ...sp, form: matches.map((m) => m.result).reverse(), formScore };
    });
  },
);

export const create = async (val: inferRouterInputs<AppRouter>["season"]["create"]) =>
  api.season.create(val);
