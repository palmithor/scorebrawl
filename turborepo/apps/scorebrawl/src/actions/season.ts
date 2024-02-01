"use server";

import { auth } from "@clerk/nextjs/server";
import { CreateSeasonInput } from "@scorebrawl/api";
import {
  createSeason,
  findOngoingSeason,
  getAllSeasons,
  getMatchesBySeasonId,
  getSeasonById,
  getSeasonPlayers,
  getSeasonStats,
} from "@scorebrawl/db";
import { cache } from "react";
import { getBySlug } from "./league";

export const getByIdOrOngoing = cache(
  async ({ seasonId, leagueSlug }: { seasonId: string | "ongoing"; leagueSlug: string }) => {
    if (seasonId === "ongoing") {
      const league = await getBySlug({ leagueSlug });
      const ongoingSeason = await findOngoingSeason({
        leagueId: league.id,
        userId: auth().userId as string,
      });

      return ongoingSeason;
    }
    return getById({ seasonId });
  },
);

export const findOngoing = cache(({ leagueId }: { leagueId: string }) =>
  findOngoingSeason({ leagueId, userId: auth().userId as string }),
);

export const getById = cache(({ seasonId }: { seasonId: string }) =>
  getSeasonById({ seasonId, userId: auth().userId as string }),
);

export const getPlayers = cache(({ seasonId }: { seasonId: string }) =>
  getSeasonPlayers({ seasonId, userId: auth().userId as string }),
);

export const getMatches = cache(({ seasonId }: { seasonId: string }) =>
  getMatchesBySeasonId({ seasonId, userId: auth().userId as string }),
);

export const getAll = cache(({ leagueSlug }: { leagueSlug: string }) =>
  getAllSeasons({ leagueSlug, userId: auth().userId as string }),
);

export const getStats = cache(({ seasonId }: { seasonId: string }) =>
  getSeasonStats({ seasonId, userId: auth().userId as string }),
);

export const create = async (val: Omit<CreateSeasonInput, "userId">) =>
  createSeason({ ...val, userId: auth().userId as string });
