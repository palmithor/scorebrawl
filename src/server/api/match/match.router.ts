import { Player, TeamMatch } from "@ihs7/ts-elo";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import z from "zod";
import { pageQuerySchema } from "~/server/api/common/pagination";
import { create } from "~/server/api/match/match.schema";
import { getSeasonById } from "~/server/api/season/season.repository";
import { populateSeasonUserPlayer } from "~/server/api/season/season.util";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createCuid, leagueEvents, matches, matchPlayers, seasonPlayers } from "~/server/db/schema";
import { getByIdWhereMember, getLeagueById, getLeagueIdBySlug } from "../league/league.repository";
import { type SeasonPlayerUser } from "../types";
import {
  type MatchCreatedEventData,
  type MatchUndoEventData,
  type SeasonPlayer,
} from "~/server/db/types";

export const matchRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        seasonId: z.string(),
        pageQuery: pageQuerySchema,
      }),
    )
    .query(async ({ input, ctx }) => {
      const season = await getSeasonById({
        seasonId: input.seasonId,
        userId: ctx.auth.userId,
      });
      // verify league access
      await getLeagueById({ id: season.leagueId, userId: ctx.auth.userId });
      const seasonMatches = await ctx.db.query.matches.findMany({
        where: (match, { eq }) => eq(match.seasonId, input.seasonId),
        orderBy: (match, { desc }) => [desc(match.createdAt)],
        limit: input.pageQuery.limit,
        with: {
          matchPlayers: {
            with: {
              seasonPlayer: { with: { leaguePlayer: { columns: { userId: true } } } },
            },
          },
        },
      });

      const players = await populateSeasonUserPlayer({
        seasonPlayers: seasonMatches
          .flatMap((m) => m.matchPlayers.flatMap((mp) => mp.seasonPlayer))
          .reduce<(SeasonPlayer & { leaguePlayer: { userId: string } })[]>(
            (accumulator, currentValue) => {
              if (!accumulator.some((sp) => sp.id === currentValue.id)) {
                accumulator.push(currentValue);
              }
              return accumulator;
            },
            [],
          ),
      });

      return {
        data: seasonMatches.map((match) => ({
          id: match.id,
          homeTeam: {
            score: match.homeScore,
            expectedElo: match.homeExpectedElo,
            players: match.matchPlayers
              .filter((p) => p.homeTeam)
              .map((mp) => players.find((p) => p.id == mp.seasonPlayer.id))
              .filter((item): item is SeasonPlayerUser => !!item),
          },
          awayTeam: {
            score: match.awayScore,
            expectedElo: match.awayExpectedElo,
            players: match.matchPlayers
              .filter((p) => !p.homeTeam)
              .map((mp) => players.find((p) => p.id == mp.seasonPlayer.id))
              .filter((item): item is SeasonPlayerUser => !!item),
          },
          createdBy: match.createdBy,
          updatedBy: match.updatedBy,
          createdAt: match.createdAt,
          updatedAt: match.updatedAt,
        })),
        nextCursor: undefined,
      };
    }),
  getLatest: protectedProcedure
    .input(
      z.object({
        leagueSlug: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const leagueId = await getLeagueIdBySlug({
        slug: input.leagueSlug,
        userId: ctx.auth.userId,
      });

      const leagueMatches = await ctx.db.query.leagues.findFirst({
        where: (league, { eq }) => eq(league.id, leagueId),
        with: {
          seasons: {
            columns: { id: true, name: true },
            with: {
              matches: {
                limit: 1,
                orderBy: (match, { desc }) => [desc(match.createdAt)],
                with: {
                  matchPlayers: {
                    with: {
                      seasonPlayer: { with: { leaguePlayer: { columns: { userId: true } } } },
                    },
                  },
                },
              },
            },
          },
        },
      });

      const allMatches = leagueMatches?.seasons.flatMap((s) => s.matches) ?? [];
      if (!leagueMatches || allMatches.length < 1) {
        return null;
      }
      const latestMatchAcrossSeasons = allMatches.reduce((currentNewest, currentItem) => {
        if (currentNewest?.createdAt && currentItem.createdAt > currentNewest.createdAt) {
          return currentItem;
        }
        return currentNewest;
      }, allMatches[0]);

      if (!latestMatchAcrossSeasons) {
        // can not happen
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      const players = await populateSeasonUserPlayer({
        seasonPlayers: latestMatchAcrossSeasons.matchPlayers.map((p) => p.seasonPlayer),
      });

      const season = leagueMatches.seasons.find(
        (s) => s.id === latestMatchAcrossSeasons.seasonId,
      ) as { id: string; name: string };

      return {
        id: latestMatchAcrossSeasons.id,
        season: {
          id: season.id,
          name: season.name,
        },
        homeTeam: {
          score: latestMatchAcrossSeasons.homeScore,
          expectedElo: latestMatchAcrossSeasons.homeExpectedElo,
          players: latestMatchAcrossSeasons.matchPlayers
            .filter((p) => p.homeTeam)
            .map((mp) => players.find((p) => p.id == mp.seasonPlayer.id))
            .filter((item): item is SeasonPlayerUser => !!item),
        },
        awayTeam: {
          score: latestMatchAcrossSeasons.awayScore,
          expectedElo: latestMatchAcrossSeasons.awayExpectedElo,
          players: latestMatchAcrossSeasons.matchPlayers
            .filter((p) => !p.homeTeam)
            .map((mp) => players.find((p) => p.id == mp.seasonPlayer.id))
            .filter((item): item is SeasonPlayerUser => !!item),
        },
        createdBy: latestMatchAcrossSeasons.createdBy,
        updatedBy: latestMatchAcrossSeasons.updatedBy,
        createdAt: latestMatchAcrossSeasons.createdAt,
        updatedAt: latestMatchAcrossSeasons.updatedAt,
      };
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
        inArray(seasonPlayers.id, input.homePlayerIds),
      ),
    });
    const awaySeasonPlayers = await ctx.db.query.seasonPlayers.findMany({
      where: and(
        eq(seasonPlayers.seasonId, season.id),
        inArray(seasonPlayers.id, input.awayPlayerIds),
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
    return ctx.db.transaction(async (tx) => {
      const match = await tx
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
        await tx
          .update(seasonPlayers)
          .set({ elo: playerResult.rating })
          .where(eq(seasonPlayers.id, playerResult.identifier))
          .run();
      }

      const matchPlayerValues = [
        ...awaySeasonPlayers.map((player) => ({
          id: createCuid(),
          matchId: match.id,
          eloBefore: player.elo,
          eloAfter: eloMatchResult.results.find((r) => r.identifier === player.id)?.rating,
          seasonPlayerId: player.id,
          homeTeam: false,
          createdAt: now,
          updatedAt: now,
        })),
        ...homeSeasonPlayers.map((player) => ({
          id: createCuid(),
          matchId: match.id,
          eloBefore: player.elo,
          eloAfter: eloMatchResult.results.find((r) => r.identifier === player.id)?.rating,
          seasonPlayerId: player.id,
          homeTeam: true,
          createdAt: now,
          updatedAt: now,
        })),
      ];
      await tx.insert(matchPlayers).values(matchPlayerValues).run();

      await tx
        .insert(leagueEvents)
        .values({
          id: createCuid(),
          leagueId: league.id,
          type: "match_created_v1",
          data: {
            seasonId: season.id,
            homeTeam: {
              score: match.homeScore,
              expectedElo: match.homeExpectedElo,
              leaguePlayerIds: homeSeasonPlayers.map((sp) => sp.leaguePlayerId),
            },
            awayTeam: {
              score: match.awayScore,
              expectedElo: match.awayExpectedElo,
              leaguePlayerIds: awaySeasonPlayers.map((sp) => sp.leaguePlayerId),
            },
          } as MatchCreatedEventData,
          createdBy: ctx.auth.userId,
          createdAt: now,
        })
        .run();

      return match;
    });
  }),
  undoLatest: protectedProcedure
    .input(
      z.object({
        matchId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const match = await ctx.db.query.matches.findFirst({
        where: (match, { eq }) => eq(match.id, input.matchId),
        with: {
          matchPlayers: {
            columns: { id: true, eloBefore: true, homeTeam: true },
            with: { seasonPlayer: { columns: { id: true, elo: true, leaguePlayerId: true } } },
          },
          season: { columns: { id: true, leagueId: true } },
        },
      });
      if (!match) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Match not found" });
      }
      // check read access
      await getLeagueById({ userId: ctx.auth.userId, id: match.season.leagueId });

      const isLeaguePlayer = await ctx.db.query.leaguePlayers.findFirst({
        where: (lp, { and, eq }) =>
          and(
            eq(lp.leagueId, match.season.leagueId),
            eq(lp.userId, ctx.auth.userId),
            eq(lp.disabled, false),
          ),
      });

      if (!isLeaguePlayer) {
        throw new TRPCError({ code: "FORBIDDEN", message: "User not part of league" });
      }

      const lastMatch = await ctx.db.query.matches.findFirst({
        where: (m, { eq }) => eq(m.seasonId, match.seasonId),
        orderBy: desc(matches.createdAt),
      });

      if (lastMatch?.id !== match.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the last match can be deleted" });
      }

      await ctx.db.transaction(async (tx) => {
        for (const matchPlayer of match.matchPlayers) {
          await tx
            .update(seasonPlayers)
            .set({ elo: matchPlayer.eloBefore })
            .where(eq(seasonPlayers.id, matchPlayer.seasonPlayer.id))
            .run();
        }
        await tx
          .delete(matchPlayers)
          .where(
            inArray(
              matchPlayers.id,
              match.matchPlayers.map((mp) => mp.id),
            ),
          )
          .run();

        await tx.delete(matches).where(eq(matches.id, match.id)).run();

        await ctx.db
          .insert(leagueEvents)
          .values({
            id: createCuid(),
            leagueId: match.season.leagueId,
            type: "match_undo_v1",
            data: {
              seasonId: match.season.id,
              homeTeam: {
                score: match.homeScore,
                leaguePlayerIds: match.matchPlayers
                  .filter((mp) => mp.homeTeam)
                  .map((mp) => mp.seasonPlayer.leaguePlayerId),
              },
              awayTeam: {
                score: match.awayScore,
                leaguePlayerIds: match.matchPlayers
                  .filter((mp) => !mp.homeTeam)
                  .map((mp) => mp.seasonPlayer.leaguePlayerId),
              },
              createdBy: match.createdBy,
            } as MatchUndoEventData,
            createdBy: ctx.auth.userId,
            createdAt: new Date(),
          })
          .run();
      });
    }),
});
