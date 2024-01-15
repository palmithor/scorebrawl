import { auth } from "@clerk/nextjs/server";
import { findOngoingSeason, getSeasonPlayers } from "@scorebrawl/db";
import { cache } from "react";

export const findOngoing = cache(({ leagueId }: { leagueId: string }) =>
  findOngoingSeason({ leagueId, userId: auth().userId as string }),
);

export const getPlayers = cache(({ seasonId }: { seasonId: string }) =>
  getSeasonPlayers({ seasonId, userId: auth().userId as string }),
);
