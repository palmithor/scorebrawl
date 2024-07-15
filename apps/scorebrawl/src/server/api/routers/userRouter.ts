import { z } from "zod";

import { createTRPCRouter, leagueProcedure, protectedProcedure } from "@/server/api/trpc";
import { UserRepository } from "@scorebrawl/db";

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(({ ctx }) => UserRepository.findUserById({ id: ctx.auth.userId })),
  setDefaultLeague: leagueProcedure
    .input(z.object({ leagueSlug: z.string() }))
    .query(({ ctx }) =>
      UserRepository.setDefaultLeague({ leagueId: ctx.league.id, userId: ctx.auth.userId }),
    ),
});
