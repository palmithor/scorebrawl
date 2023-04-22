import z from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getCursor, pageQuerySchema } from "~/server/api/common/pagination";
import { getByIdWhereMember } from "~/server/api/league/league.repository";
import { TRPCError } from "@trpc/server";

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
        orderBy: { id: "desc" },
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
        endsAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.endsAt && input.startedAt.getTime() >= input.endsAt.getTime()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "endsAt has to be after startedAt",
        });
      }
      const league = await getByIdWhereMember({
        leagueId: input.leagueId,
        userId: ctx.auth.userId,
        allowedRoles: ["owner", "editor"],
      });
      if (!league) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const season = await ctx.prisma.season.create({
        data: {
          name: input.name,
          leagueId: input.leagueId,
          startedAt: input.startedAt,
          endsAt: input.endsAt,
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
  updateEndsAt: protectedProcedure
    .input(
      z.object({
        seasonId: z.string().nonempty(),
        endsAt: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const season = await ctx.prisma.season.findUnique({
        where: { id: input.seasonId },
      });
      if (!season) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const league = await getByIdWhereMember({
        leagueId: season.leagueId,
        userId: ctx.auth.userId,
        allowedRoles: ["owner", "editor"],
      });
      if (!league) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await ctx.prisma.season.update({
        where: { id: season.id },
        data: { endsAt: input.endsAt },
      });
      return { ...season, endsAt: input.endsAt };
    }),
});
