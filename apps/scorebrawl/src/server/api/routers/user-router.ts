import { z } from "zod";

import { findUserById, setDefaultLeague } from "@/db/repositories/user-repository";
import { UserDTO } from "@/dto";
import { createTRPCRouter, leagueProcedure, protectedProcedure } from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await findUserById({ id: ctx.auth.user.id });
    return UserDTO.parse({
      userId: user?.id,
      name: user?.name,
      image: user?.image ?? undefined,
      defaultLeagueId: user?.defaultLeagueId ?? undefined,
    });
  }),
  setDefaultLeague: leagueProcedure.input(z.object({ leagueSlug: z.string() })).query(({ ctx }) =>
    setDefaultLeague({
      leagueId: ctx.league.id,
      userId: ctx.auth.user.id,
    }),
  ),
});
