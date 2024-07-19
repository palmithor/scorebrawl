//

import { createTRPCRouter, protectedProcedure, seasonProcedure } from "@/server/api/trpc";
import { UserRepository } from "@scorebrawl/db";
import { z } from "zod";

export const avatarRouter = createTRPCRouter({
  getByUserId: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input: { userId } }) => UserRepository.getUserAvatar({ userId })),
  getBySeasonTeamIds: seasonProcedure
    .input(
      z.object({
        leagueSlug: z.string(),
        seasonSlug: z.string(),
        seasonTeamIds: z.array(z.string()).min(1),
      }),
    )
    .query(({ input: { seasonTeamIds } }) => UserRepository.getTeamAvatars({ seasonTeamIds })),
  getBySeasonPlayerIds: seasonProcedure
    .input(
      z.object({
        leagueSlug: z.string(),
        seasonSlug: z.string(),
        seasonPlayerIds: z.array(z.string()).min(1),
      }),
    )
    .query(({ input: { seasonPlayerIds } }) =>
      UserRepository.getSeasonPlayerAvatars({ seasonPlayerIds }),
    ),
});
