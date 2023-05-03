import z from "zod";
import { Player, TeamMatch } from "@ihs7/ts-elo";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getCursor, pageQuerySchema } from "~/server/api/common/pagination";
import { TRPCError } from "@trpc/server";
import { getByIdWhereMember } from "../league/league.repository";

export const matchRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        seasonId: z.string(),
        pageQuery: pageQuerySchema,
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.pageQuery.limit;
      const result = await ctx.prisma.match.findMany({
        take: input.pageQuery.limit,
        cursor: getCursor(input.pageQuery),
        where: {
          seasonId: input.seasonId,
          season: {
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
        seasonId: z.string().nonempty(),
        homePlayerIds: z.string().array().nonempty(),
        awayPlayerIds: z.string().array().nonempty(),
        homeScore: z.number().int(),
        awayScore: z.number().int(),
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
        allowedRoles: ["member", "owner", "editor"],
      });
      if (!league) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "league access denied",
        });
      }
      if (league.archived) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "league is archived",
        });
      }

      const homeSeasonPlayers = await ctx.prisma.seasonPlayer.findMany({
        where: { seasonId: season.id, id: { in: input.homePlayerIds } },
      });
      const awaySeasonPlayers = await ctx.prisma.seasonPlayer.findMany({
        where: { seasonId: season.id, id: { in: input.awayPlayerIds } },
      });
      if (homeSeasonPlayers.length !== input.homePlayerIds.length) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "some players in home team not part of season",
        });
      }
      if (awaySeasonPlayers.length !== input.awayPlayerIds.length) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "some players in away team not part of season",
        });
      }

      const eloTeamMatch = new TeamMatch({ kFactor: season.kFactor });
      const eloHomeTeam = eloTeamMatch.addTeam("home", input.homeScore);
      homeSeasonPlayers.forEach((p) => {
        eloHomeTeam.addPlayer(new Player(p.id, p.elo));
      });
      const eloAwayTeam = eloTeamMatch.addTeam("away", input.awayScore);
      awaySeasonPlayers.forEach((p) => {
        eloAwayTeam.addPlayer(new Player(p.id, p.elo));
      });
      const eloMatchResult = eloTeamMatch.calculate();

      const match = await ctx.prisma.match.create({
        data: {
          homeScore: input.homeScore,
          awayScore: input.awayScore,
          homeExpectedElo: eloHomeTeam.expectedScoreAgainst(eloAwayTeam),
          awayExpectedElo: eloAwayTeam.expectedScoreAgainst(eloHomeTeam),
          seasonId: season.id,
          createdBy: ctx.auth.userId,
        },
      });
      for (const playerResult of eloMatchResult.results) {
        await ctx.prisma.seasonPlayer.update({
          where: { id: playerResult.identifier },
          data: { elo: playerResult.rating },
        });
      }

      for (const player of homeSeasonPlayers) {
        await ctx.prisma.matchPlayer.create({
          data: {
            matchId: match.id,
            elo: player.elo,
            seasonPlayerId: player.id,
            homeTeam: true,
          },
        });
      }

      for (const player of awaySeasonPlayers) {
        await ctx.prisma.matchPlayer.create({
          data: {
            matchId: match.id,
            elo: player.elo,
            seasonPlayerId: player.id,
            homeTeam: false,
          },
        });
      }
      return match;
    }),
  /*undo: protectedProcedure
    .input(
      z.object({
        matchId: z.string().nonempty(),
      })
    )
    .mutation(({ ctx, input }) => {
      throw new TRPCError({ code: "FORBIDDEN" });
    }),
    */
});
