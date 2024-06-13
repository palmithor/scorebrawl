"use server";

import { auth } from "@clerk/nextjs/server";
import type { CreateSeasonInput } from "@scorebrawl/api";
import {
  createSeason,
  findOngoingSeason,
  getAllSeasons,
  getMatchesBySeasonId,
  getSeasonById,
  getSeasonPlayerLatestMatches,
  getSeasonPlayers,
  getSeasonPlayersPointDiff,
  getSeasonPointProgression,
  getSeasonStats,
  getSeasonTeams,
  getSeasonTeamsLatestMatches,
  getSeasonTeamsPointDiff,
} from "@scorebrawl/db";
import type { SeasonPlayer } from "@scorebrawl/db/types";
import { cache } from "react";
import { getBySlug } from "./league";

export const getByIdOrOngoing = cache(async (seasonId: string | "ongoing", leagueSlug: string) => {
  if (seasonId === "ongoing") {
    const league = await getBySlug(leagueSlug);
    return await findOngoingSeason({
      leagueId: league.id,
      userId: auth().userId as string,
    });
  }
  return getById(seasonId);
});

export const findOngoing = cache((leagueId: string) =>
  findOngoingSeason({ leagueId, userId: auth().userId as string }),
);

export const getById = cache((seasonId: string) =>
  getSeasonById({ seasonId, userId: auth().userId as string }),
);

export const getPlayers = cache(async (seasonId: string) =>
  getSeasonPlayers({ seasonId, userId: auth().userId as string }),
);

export const getPlayerPointDiff = cache((seasonPlayerIds: string[]) =>
  getSeasonPlayersPointDiff({ seasonPlayerIds }),
);

export const getPlayersForm = cache(
  async ({ seasonPlayers }: { seasonPlayers: SeasonPlayer[] }) => {
    const latestMatches = await getSeasonPlayerLatestMatches({
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

export const getMatches = cache((seasonId: string) =>
  getMatchesBySeasonId({ seasonId, userId: auth().userId as string }),
);

export const getAll = cache((leagueSlug: string) =>
  getAllSeasons({ leagueSlug, userId: auth().userId as string }),
);

export const getStats = cache((seasonId: string) =>
  getSeasonStats({ seasonId, userId: auth().userId as string }),
);
export const getPointProgression = cache((seasonId: string) =>
  getSeasonPointProgression({ seasonId, userId: auth().userId as string }),
);

export const create = async (val: Omit<CreateSeasonInput, "userId">) =>
  createSeason({ ...val, userId: auth().userId as string });

export const getTeams = cache(async (seasonId: string) =>
  getSeasonTeams({ seasonId, userId: auth().userId as string }),
);

export const getTeamPointDiff = cache((seasonTeamIds: string[]) =>
  seasonTeamIds.length > 0 ? getSeasonTeamsPointDiff({ seasonTeamIds }) : [],
);

export const getTeamsForm = cache(async (seasonTeams: { id: string }[]) => {
  if (seasonTeams.length < 1) return [];
  const latestMatches = await getSeasonTeamsLatestMatches({
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
