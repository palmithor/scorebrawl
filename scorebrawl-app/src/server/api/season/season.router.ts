import { TRPCError } from "@trpc/server";
import { endOfDay, startOfDay } from "date-fns";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import z from "zod";
import { pageQuerySchema } from "~/server/api/common/pagination";
import {
  canReadLeaguesCriteria,
  getByIdWhereMember,
  getLeagueById,
} from "~/server/api/league/league.repository";
import { getOngoingSeason } from "~/server/api/season/season.repository";
import { createTRPCRouter, leagueProcedure, protectedProcedure } from "~/server/api/trpc";
import { type MatchResult } from "~/server/api/types";
import { db } from "~/server/db";
import {
  createCuid,
  leagueEvents,
  leaguePlayers,
  leagues,
  matches,
  seasonPlayers,
  seasonTeams,
  seasons,
} from "~/server/db/schema";
import { type Db, type SeasonCreatedEventData } from "~/server/db/types";
import { slugifySeasonName } from "../common/slug";
import { create } from "./season.schema";

const getSeason = async ({ seasonId, userId }: { seasonId: string; userId: string }) => {
  const season = await db.query.seasons.findFirst({
    where: eq(seasons.id, seasonId),
  });
  if (!season) {
    throw new TRPCError({ code: "NOT_FOUND", message: "season not found" });
  }

  const league = await db.query.leagues.findFirst({
    where: and(canReadLeaguesCriteria({ userId }), eq(leagues.id, season?.leagueId)),
  });
  if (!league) {
    throw new TRPCError({ code: "NOT_FOUND", message: "season not found" });
  }
  return season;
};

const checkOngoing = async (
  db: Db,
  input: {
    leagueId: string;
    startDate: Date;
    endDate?: Date;
  },
) => {
  const ongoingSeason = await db.query.seasons.findFirst({
    where: and(
      eq(seasons.leagueId, input.leagueId),
      gte(seasons.endDate, input.startDate),
      input?.endDate ? lte(seasons.startDate, input?.endDate) : sql`true`,
    ),
  });
  if (ongoingSeason) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "There's an ongoing season during this period",
    });
  }
};

export const seasonRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(z.object({ leagueSlug: z.string().nonempty(), seasonId: z.string() }))
    .query(async ({ input, ctx }) => {
      const season = await ctx.db.query.seasons.findFirst({
        where: eq(seasons.id, input.seasonId),
      });
      if (!season) {
        throw new TRPCError({ code: "NOT_FOUND", message: "season not found" });
      }
      await getLeagueById({
        userId: ctx.auth.userId,
        id: season.leagueId,
      });
      return season;
    }),
  getOngoing: leagueProcedure
    .input(z.object({ leagueSlug: z.string().nonempty() }))
    .query(async ({ ctx }) => {
      const ongoingSeason = await getOngoingSeason({ leagueId: ctx.league.id });
      if (!ongoingSeason) {
        throw new TRPCError({ code: "NOT_FOUND", message: "season not found" });
      }
      return ongoingSeason;
    }),
  getAll: leagueProcedure
    .input(
      z.object({
        leagueSlug: z.string(),
        pageQuery: pageQuerySchema,
      }),
    )
    .query(async ({ input, ctx }) => {
      const result = await ctx.db
        .select()
        .from(seasons)
        .innerJoin(leagues, eq(leagues.id, seasons.leagueId))
        .where(
          and(
            eq(seasons.leagueId, leagues.id),
            eq(leagues.slug, input.leagueSlug),
            canReadLeaguesCriteria({ userId: ctx.auth.userId }),
          ),
        )
        .orderBy(desc(seasons.startDate))
        .all();

      return {
        data: result.map((r) => r.season),
        nextCursor: undefined,
      };
    }),
  getPlayers: protectedProcedure
    .input(
      z.object({
        seasonId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const season = await getSeason({
        seasonId: input.seasonId,
        userId: ctx.auth.userId,
      });

      const seasonPlayerResult = await ctx.db.query.seasonPlayers.findMany({
        where: eq(seasonPlayers.seasonId, season.id),
        extras: (seasonPlayer, { sql }) => ({
          matchCount:
            sql<number>`(SELECT COUNT(*) FROM match_player mp WHERE mp.season_player_id = "seasonPlayers"."id")`.as(
              "matchCount",
            ),
        }),
        with: {
          leaguePlayer: {
            columns: { userId: true },
            with: {
              user: {
                columns: { imageUrl: true, name: true },
              },
            },
          },
        },
        orderBy: desc(seasonPlayers.elo),
      });

      return seasonPlayerResult.map((sp) => ({
        id: sp.id,
        userId: sp.leaguePlayer.userId,
        name: sp.leaguePlayer.user.name,
        imageUrl: sp.leaguePlayer.user.imageUrl,
        elo: sp.elo,
        joinedAt: sp.createdAt,
        disabled: sp.disabled,
        matchCount: sp.matchCount,
      }));
    }),
  getTeams: protectedProcedure
    .input(
      z.object({
        seasonId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const season = await getSeason({
        seasonId: input.seasonId,
        userId: ctx.auth.userId,
      });
      const teams = await ctx.db.query.seasonTeams.findMany({
        extras: (seasonTeam, { sql }) => ({
          matchCount:
            sql<number>`(SELECT COUNT(*) FROM season_team_match stm WHERE stm.season_team_id = "seasonTeams"."id")`.as(
              "matchCount",
            ),
        }),
        where: eq(seasonTeams.seasonId, season.id),
        columns: { id: true, elo: true, createdAt: true, updatedAt: true },
        orderBy: desc(seasonTeams.elo),
        with: {
          leagueTeam: {
            columns: { id: true, name: true },
            with: {
              players: {
                columns: { id: true },
                with: {
                  leaguePlayer: {
                    columns: { id: true },
                    with: { user: { columns: { name: true, imageUrl: true } } },
                  },
                },
              },
            },
          },
        },
      });
      return teams.map((team) => ({
        id: team.id,
        leagueTeamId: team.leagueTeam.id,
        name: team.leagueTeam.name,
        elo: team.elo,
        players: team.leagueTeam.players.map((p) => ({
          id: p.leaguePlayer.id,
          name: p.leaguePlayer.user.name,
          imageUrl: p.leaguePlayer.user.imageUrl,
        })),
        matchCount: team.matchCount,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
      }));
    }),
  create: leagueProcedure.input(create).mutation(async ({ ctx, input }) => {
    if (input.endDate && input.startDate.getTime() >= input.endDate.getTime()) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "endDate has to be after startDate",
      });
    }
    const league = await getByIdWhereMember({
      leagueId: ctx.league.id,
      userId: ctx.auth.userId,
      allowedRoles: ["owner", "editor"],
    });

    if (!league) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    await checkOngoing(ctx.db, {
      leagueId: ctx.league.id,
      startDate: input.startDate,
      endDate: input.endDate,
    });

    const slug = await slugifySeasonName({ name: input.name });
    const now = new Date();
    const season = await ctx.db
      .insert(seasons)
      .values({
        id: createCuid(),
        name: input.name,
        slug,
        leagueId: ctx.league.id,
        startDate: input.startDate,
        endDate: input.endDate,
        initialElo: input.initialElo,
        kFactor: input.kFactor,
        updatedBy: ctx.auth.userId,
        createdBy: ctx.auth.userId,
        createdAt: now,
        updatedAt: now,
      })
      .returning()
      .get();
    const players = await ctx.db.query.leaguePlayers.findMany({
      columns: { id: true },
      where: and(eq(leaguePlayers.leagueId, ctx.league.id), eq(leaguePlayers.disabled, false)),
    });
    await Promise.all(
      players.map((lp) =>
        ctx.db.insert(seasonPlayers).values({
          id: createCuid(),
          disabled: false,
          elo: season.initialElo,
          leaguePlayerId: lp.id,
          seasonId: season.id,
          createdAt: now,
          updatedAt: now,
        }),
      ),
    );

    await ctx.db
      .insert(leagueEvents)
      .values({
        id: createCuid(),
        leagueId: league.id,
        type: "season_created_v1",
        data: { seasonId: season.id } as SeasonCreatedEventData,
        createdBy: ctx.auth.userId,
        createdAt: now,
      })
      .run();

    return season;
  }),
  update: protectedProcedure
    .input(
      z.object({
        seasonId: z.string().nonempty(),
        name: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const season = await ctx.db.query.seasons.findFirst({
        where: eq(seasons.id, input.seasonId),
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

      return ctx.db
        .update(seasons)
        .set({
          name: input.name,
          startDate: input.startDate,
          endDate: input.endDate,
        })
        .where(eq(seasons.id, input.seasonId))
        .returning()
        .get();
    }),
  playerForm: protectedProcedure
    .input(
      z.object({
        seasonPlayerId: z.string().nonempty(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const playerMatches = await ctx.db.query.seasonPlayers.findFirst({
        columns: { id: true },
        where: eq(seasonPlayers.id, input.seasonPlayerId),
        with: {
          matches: {
            orderBy: (match, { desc }) => [desc(match.createdAt)],
            limit: 5,
          },
        },
      });
      // todo make column not null
      return playerMatches?.matches.reverse().map((m) => m.result as MatchResult) || [];
    }),
  teamForm: protectedProcedure
    .input(
      z.object({
        seasonTeamId: z.string().nonempty(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const team = await ctx.db.query.seasonTeams.findFirst({
        columns: { id: true },
        where: eq(seasonTeams.id, input.seasonTeamId),
        with: {
          matches: {
            orderBy: (match, { desc }) => [desc(match.createdAt)],
            limit: 5,
            with: {
              match: true,
            },
          },
        },
      });
      // todo make column not null
      return team?.matches.reverse().map((tm) => tm.result as MatchResult) || [];
    }),
  playerPointDiff: protectedProcedure
    .input(
      z.object({
        seasonPlayerId: z.string().nonempty(),
        from: z.date().default(startOfDay(new Date())),
        to: z.date().default(endOfDay(new Date())),
      }),
    )
    .query(async ({ ctx, input }) => {
      const matchPlayers = await ctx.db.query.matchPlayers.findMany({
        where: (matchPlayer, { eq, and }) =>
          and(
            eq(matchPlayer.seasonPlayerId, input.seasonPlayerId),
            gte(matchPlayer.createdAt, input.from),
            lte(matchPlayer.createdAt, input.to),
          ),
        orderBy: (matchPlayer, { asc }) => [asc(matchPlayer.createdAt)],
      });

      if (matchPlayers.length > 0) {
        return {
          diff:
            (matchPlayers[matchPlayers.length - 1]?.eloAfter ?? 0) -
            (matchPlayers[0]?.eloBefore ?? 0),
        };
      }
      return { diff: 0 };
    }),
  teamPointDiff: protectedProcedure
    .input(
      z.object({
        seasonTeamId: z.string().nonempty(),
        from: z.date().default(startOfDay(new Date())),
        to: z.date().default(endOfDay(new Date())),
      }),
    )
    .query(async ({ ctx, input }) => {
      const matchResult = await ctx.db.query.teamMatches.findMany({
        where: (teamMatch, { eq, and }) =>
          and(
            eq(teamMatch.seasonTeamId, input.seasonTeamId),
            gte(teamMatch.createdAt, input.from),
            lte(teamMatch.createdAt, input.to),
          ),
        orderBy: (matchPlayer, { asc }) => [asc(matchPlayer.createdAt)],
      });

      if (matchResult.length > 0) {
        return {
          diff:
            (matchResult[matchResult.length - 1]?.eloAfter ?? 0) - (matchResult[0]?.eloBefore ?? 0),
        };
      }
      return { diff: undefined };
    }),
  getStats: protectedProcedure
    .input(
      z.object({
        seasonId: z.string().nonempty(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const season = await getSeason({
        userId: ctx.auth.userId,
        seasonId: input.seasonId,
      });

      const matchCount = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(matches)
        .where(eq(matches.seasonId, season.id))
        .get();
      const teamCount = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(seasonTeams)
        .where(eq(seasonTeams.seasonId, season.id))
        .get();
      const playerCount = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(seasonPlayers)
        .where(eq(seasonPlayers.seasonId, season.id))
        .get();
      return {
        matchCount: matchCount?.count || 0,
        teamCount: teamCount?.count || 0,
        playerCount: playerCount?.count || 0,
      };
    }),
});
