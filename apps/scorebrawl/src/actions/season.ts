"use server";

import { api } from "@/trpc/server";
import { cache } from "react";

export const findSeasonBySlug = cache(async (leagueSlug: string, seasonSlug: string) =>
  api.season.findBySlug({ leagueSlug, seasonSlug }),
);
