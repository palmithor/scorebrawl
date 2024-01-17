"use server";

import { auth } from "@clerk/nextjs/server";
import { CreateSeasonInput } from "@scorebrawl/api";
import { createSeason, findOngoingSeason, getAllSeasons, getSeasonPlayers } from "@scorebrawl/db";
import { cache } from "react";

export const findOngoing = cache(({ leagueId }: { leagueId: string }) =>
  findOngoingSeason({ leagueId, userId: auth().userId as string }),
);

export const getPlayers = cache(({ seasonId }: { seasonId: string }) =>
  getSeasonPlayers({ seasonId, userId: auth().userId as string }),
);

export const getAll = cache(({ leagueSlug }: { leagueSlug: string }) =>
  getAllSeasons({ leagueSlug, userId: auth().userId as string }),
);

export const create = async (val: Omit<CreateSeasonInput, "userId">) =>
  createSeason({ ...val, userId: auth().userId as string });
