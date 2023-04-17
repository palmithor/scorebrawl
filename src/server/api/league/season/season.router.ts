import z from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getCursor, pageQuerySchema } from "~/server/api/common/pagination";
import { getByIdWhereMember } from "../league.repository";

export const seasonRouter = createTRPCRouter({
  getAllSeasons: protectedProcedure
    .input(
      z.object({
        leagueId: z.string(),
        pageQuery: pageQuerySchema,
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.pageQuery.limit;
      const result = await ctx.prisma.season.findMany({
        take: input.pageQuery.limit,
        cursor: getCursor(input.pageQuery),
        where: {
          leagueId: input.leagueId,
          league: {
            OR: [
              {
                isPrivate: false,
              },
              {
                members: {
                  some: { userId: ctx.auth.userId },
                },
              },
            ],
          },
        },
        orderBy: { id: "asc" },
      });
      return {
        data: result,
        nextCursor: result[limit - 1]?.id,
      };
    }),
  create: protectedProcedure
    .input(
      z.object({
        leagueId: z.string().nonempty(),
        name: z.string().nonempty(),
        startedAt: z.date().optional().default(new Date()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const league = await getByIdWhereMember({
        leagueId: input.leagueId,
        userId: ctx.auth.userId,
        allowedRoles: ["owner", "editor"],
      });
      const season = await ctx.prisma.season.create({
        data: {
          name: input.name,
          leagueId: input.leagueId,
          startedAt: input.startedAt,
          updatedBy: ctx.auth.userId,
          createdBy: ctx.auth.userId,
        },
      });
      const leaguePlayers = await ctx.prisma.leaguePlayer.findMany({
        select: { id: true },
        where: { leagueId: input.leagueId, disabled: false },
      });
      await Promise.all(
        leaguePlayers.map((lp) =>
          ctx.prisma.seasonPlayer.create({
            data: {
              elo: league.initialElo,
              leaguePlayerId: lp.id,
              seasonId: season.id,
            },
          })
        )
      );

      return season;
    }),
});
