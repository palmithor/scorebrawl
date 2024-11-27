import { z } from "zod";

import { createTRPCRouter, leagueProcedure, protectedProcedure } from "@/server/api/trpc";
import { UserDTO } from "@scorebrawl/api";
import { findUserById, setDefaultLeague } from "@scorebrawl/db/user";

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
