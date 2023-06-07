import z from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getCursor, pageQuerySchema } from "~/server/api/common/pagination";
import { getByIdWhereMember } from "~/server/api/league/league.repository";
import { TRPCError } from "@trpc/server";
import { type PrismaClient } from "@prisma/client";

const checkOngoing = async (
  prisma: PrismaClient,
  input: {
    leagueId: string;
    startDate: Date;
    endDate?: Date;
  }
) => {
  const ongoingSeason = await prisma.season.findFirst({
    where: {
      leagueId: input.leagueId,
      startDate: {
        lte: input.endDate,
      },
      endDate: {
        gte: input.startDate,
      },
    },
  });
  if (ongoingSeason) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "There's an ongoing season during this period",
    });
  }
};

export const seasonRouter = createTRPCRouter({
  getAll: protectedProcedure
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
                visibility: "public",
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
  table: protectedProcedure
    .input(
      z.object({
        seasonId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const season = await ctx.prisma.season.findFirst({
        where: {
          id: input.seasonId,
          league: {
            OR: [
              {
                visibility: "public",
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
      if (!season) {
        throw new TRPCError({ code: "NOT_FOUND", message: "season not found" });
      }

      return ctx.prisma.seasonPlayer.findMany({
        where: { id: season.id },
        orderBy: { elo: "desc" },
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
        leagueId: z.string().nonempty(),
        name: z.string().nonempty(),
        startDate: z.date().optional().default(new Date()),
        endDate: z.date().optional(),
        initialElo: z.number().int().min(100).default(1200),
        kFactor: z.number().int().min(10).max(50).default(32),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (
        input.endDate &&
        input.startDate.getTime() >= input.endDate.getTime()
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "endDate has to be after startDate",
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
      await checkOngoing(ctx.prisma, input);

      const season = await ctx.prisma.season.create({
        data: {
          name: input.name,
          leagueId: input.leagueId,
          startDate: input.startDate,
          endDate: input.endDate,
          initialElo: input.initialElo,
          kFactor: input.kFactor,
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
              elo: season.initialElo,
              leaguePlayerId: lp.id,
              seasonId: season.id,
            },
          })
        )
      );

      return season;
    }),
  update: protectedProcedure
    .input(
      z.object({
        seasonId: z.string().nonempty(),
        name: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const season = await ctx.prisma.season.findUnique({
        where: { id: input.seasonId },
      });
      if (!season) {
        throw new TRPCError({ code: "NOT_FOUND", message: "season not found" });
      }
      const league = await getByIdWhereMember({
        leagueId: season.leagueId,
        userId: ctx.auth.userId,
        allowedRoles: ["owner", "editor"],
      });
      if (!league) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "league access denied",
        });
      }
      if (league.archived) {
        throw new TRPCError({ code: "CONFLICT", message: "league archived" });
      }

      await ctx.prisma.season.update({
        where: { id: season.id },
        data: {
          name: input.name,
          startDate: input.startDate,
          endDate: input.endDate,
        },
      });
      return { ...season, ...input };
    }),
});
