"use server";

import type { AppRouter } from "@/server/api/root";
import { api } from "@/trpc/server";
import { auth } from "@clerk/nextjs/server";
import {
  MatchRepository,
  PlayerRepository,
  SeasonRepository,
  SeasonTeamRepositoryV1,
} from "@scorebrawl/db";
import type { SeasonPlayer } from "@scorebrawl/db/types";
import type { inferRouterInputs } from "@trpc/server";
import { cache } from "react";
import { findBySlug } from "./league";

export const getBySlugOrOngoing = cache(
  async (seasonSlug: string | "ongoing", leagueSlug: string) => {
    const league = await findBySlug(leagueSlug);
    if (seasonSlug === "ongoing") {
      return await SeasonRepository.findOngoingSeason({
        leagueId: league?.id ?? "",
        userId: auth().userId as string,
      });
    }
    return SeasonRepository.getBySlug({
      seasonSlug,
      leagueId: league?.id ?? "",
      userId: auth().userId as string,
    });
  },
);

export const findOngoing = cache((leagueId: string) =>
  SeasonRepository.findOngoingSeason({ leagueId, userId: auth().userId as string }),
);

export const getById = cache((seasonId: string, leagueId: string) =>
  SeasonRepository.getById({ seasonId, leagueId, userId: auth().userId as string }),
);

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

export const getMatches = cache((seasonId: string, leagueId: string) =>
  MatchRepository.getBySeasonId({ leagueId, seasonId, userId: auth().userId as string }),
);

export const getAll = cache((leagueSlug: string) =>
  SeasonRepository.getAllSeasons({ leagueSlug, userId: auth().userId as string }),
);

export const create = async (val: inferRouterInputs<AppRouter>["season"]["create"]) =>
  api.season.create(val);

export const getTeams = cache(async (seasonId: string, leagueId: string) =>
  SeasonTeamRepositoryV1.getTeams({ leagueId, seasonId, userId: auth().userId as string }),
);

export const getTeamPointDiff = cache(async (seasonTeamIds: string[]) =>
  seasonTeamIds.length > 0 ? SeasonTeamRepositoryV1.getTeamsPointDiff({ seasonTeamIds }) : [],
);

export const getTeamsForm = cache(async (seasonTeams: { id: string }[]) => {
  if (seasonTeams.length < 1) return [];
  const latestMatches = await SeasonTeamRepositoryV1.getTeamsLatestMatches({
    seasonTeamIds: seasonTeams.map((sp) => sp.id),
  });
  return seasonTeams.map((sp) => {
    const matches = latestMatches.find((lm) => lm.id === sp.id)?.matches || [];
    const formScore = matches
      .map((m) => m.result)
      .reduce((sum, result) => sum + (result === "W" ? 3 : result === "D" ? 1 : 0), 0);
    return { ...sp, form: matches.map((m) => m.result).reverse(), formScore };
  });
});
