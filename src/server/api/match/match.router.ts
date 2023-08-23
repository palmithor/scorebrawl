import { Player, TeamMatch } from "@ihs7/ts-elo";
import { and, desc, eq, inArray } from "drizzle-orm";
import z from "zod";
import { pageQuerySchema } from "~/server/api/common/pagination";
import { create } from "~/server/api/match/match.schema";
import { getSeasonById } from "~/server/api/season/season.repository";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  createCuid,
  matches,
  matchPlayers,
  seasonPlayers,
  seasons,
} from "~/server/db/schema";
import {
  getByIdWhereMember,
  getLeagueIdBySlug,
} from "../league/league.repository";
import { TRPCError } from "@trpc/server";

export const matchRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        seasonId: z.string(),
        pageQuery: pageQuerySchema,
      })
    )
    .query(async ({ input, ctx }) => {
      const season = await getSeasonById({
        seasonId: input.seasonId,
        userId: ctx.auth.userId,
      });
      const result = await ctx.db
        .select()
        .from(matches)
        .where(eq(seasons.id, season.id))
        .orderBy(desc(matches.createdAt))
        .all();
      return {
        data: result,
        nextCursor: undefined,
      };
    }),
  getLatest: protectedProcedure
    .input(
      z.object({
        leagueSlug: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      await getLeagueIdBySlug({
        slug: input.leagueSlug,
        userId: ctx.auth.userId,
      });

      const latestMatch = await ctx.db.query.matches.findFirst({
        with: {
          players: {
            with: {
              player: {
                with: { leaguePlayer: true },
              },
            },
          },
          season: {
            with: {
              league: true,
            },
          },
        },
      });
      if (!latestMatch) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "no matches played",
        });
      }
      return latestMatch;
    }),
  create: protectedProcedure.input(create).mutation(async ({ ctx, input }) => {
    const season = await getSeasonById({
      seasonId: input.seasonId,
      userId: ctx.auth.userId,
    });
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

    const homeSeasonPlayers = await ctx.db.query.seasonPlayers.findMany({
      where: and(
        eq(seasonPlayers.seasonId, season.id),
        inArray(seasonPlayers.id, input.homePlayerIds)
      ),
    });
    const awaySeasonPlayers = await ctx.db.query.seasonPlayers.findMany({
      where: and(
        eq(seasonPlayers.seasonId, season.id),
        inArray(seasonPlayers.id, input.awayPlayerIds)
      ),
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
    const now = new Date();
    const match = await ctx.db
      .insert(matches)
      .values({
        id: createCuid(),
        homeScore: input.homeScore,
        awayScore: input.awayScore,
        homeExpectedElo: eloHomeTeam.expectedScoreAgainst(eloAwayTeam),
        awayExpectedElo: eloAwayTeam.expectedScoreAgainst(eloHomeTeam),
        seasonId: season.id,
        createdBy: ctx.auth.userId,
        updatedBy: ctx.auth.userId,
        createdAt: now,
        updatedAt: now,
      })
      .returning()
      .get();

    for (const playerResult of eloMatchResult.results) {
      await ctx.db
        .update(seasonPlayers)
        .set({ elo: playerResult.rating })
        .where(eq(seasonPlayers.id, playerResult.identifier))
        .run();
    }

    for (const player of homeSeasonPlayers) {
      await ctx.db
        .insert(matchPlayers)
        .values({
          id: createCuid(),
          matchId: match.id,
          elo: player.elo,
          seasonPlayerId: player.id,
          homeTeam: true,
          createdAt: now,
          updatedAt: now,
        })
        .run();
    }

    for (const player of awaySeasonPlayers) {
      await ctx.db
        .insert(matchPlayers)
        .values({
          id: createCuid(),
          matchId: match.id,
          elo: player.elo,
          seasonPlayerId: player.id,
          homeTeam: false,
          createdAt: now,
          updatedAt: now,
        })
        .run();
    }
    return match;
  }),
});
