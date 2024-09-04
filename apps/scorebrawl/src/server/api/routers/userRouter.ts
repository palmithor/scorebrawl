import { z } from "zod";

import { createTRPCRouter, leagueProcedure, protectedProcedure } from "@/server/api/trpc";
import { UserDTO } from "@scorebrawl/api";
import { UserRepository } from "@scorebrawl/db";

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await UserRepository.findUserById({ id: ctx.auth.userId });
    return UserDTO.parse({
      userId: user?.id,
      name: user?.name,
      imageUrl: user?.imageUrl,
      defaultLeagueId: user?.defaultLeagueId ?? undefined,
    });
  }),
  setDefaultLeague: leagueProcedure.input(z.object({ leagueSlug: z.string() })).query(({ ctx }) =>
    UserRepository.setDefaultLeague({
      leagueId: ctx.league.id,
      userId: ctx.auth.userId,
    }),
  ),
});
