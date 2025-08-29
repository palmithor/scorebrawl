import { z } from "zod";

import { auth } from "@/lib/auth";
import { createTRPCRouter, leagueProcedure, protectedProcedure } from "@/server/api/trpc";
import { UserDTO } from "@scorebrawl/api";
import { findUserById, setDefaultLeague } from "@scorebrawl/db/user";
import { headers } from "next/headers";

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
  setPassword: protectedProcedure
    .input(z.object({ password: z.string() }))
    .mutation(async ({ input: { password } }) => {
      await auth.api.setPassword({
        body: { newPassword: password },
        headers: await headers(),
      });
    }),
  setDefaultLeague: leagueProcedure.input(z.object({ leagueSlug: z.string() })).query(({ ctx }) =>
    setDefaultLeague({
      leagueId: ctx.league.id,
      userId: ctx.auth.user.id,
    }),
  ),
});
