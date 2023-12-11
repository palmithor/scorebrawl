import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import z from "zod";
import { getByIdWhereMember } from "~/server/api/league/league.repository";
import { createTRPCRouter, leagueProcedure } from "~/server/api/trpc";
import { leagueTeams } from "~/server/db/schema";

export const teamRouter = createTRPCRouter({
  update: leagueProcedure
    .input(
      z.object({
        leagueSlug: z.string().nonempty(),
        teamId: z.string(),
        name: z.string().nonempty(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const league = await getByIdWhereMember({
        leagueId: ctx.league.id,
        userId: ctx.auth.userId,
        allowedRoles: ["owner", "editor"],
      });
      const team = await ctx.db.query.leagueTeams.findFirst({
        where: (team, { eq, and }) =>
          and(eq(team.id, input.teamId), eq(team.leagueId, ctx.league.id)),
        with: {
          players: {
            columns: { id: true },
            with: {
              leaguePlayer: {
                columns: { id: true },
                with: { user: { columns: { id: true } } },
              },
            },
          },
        },
      });
      if (!league && !team?.players.map((p) => p.leaguePlayer.user.id).includes(ctx.auth.userId)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to update this team",
        });
      }
      return ctx.db
        .update(leagueTeams)
        .set({
          name: input.name,
        })
        .where(eq(leagueTeams.id, input.teamId))
        .returning()
        .get();
    }),
});
