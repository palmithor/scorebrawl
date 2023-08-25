import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import z from "zod";
import { pageQuerySchema } from "~/server/api/common/pagination";
import {
  canReadLeaguesCriteria,
  getByIdWhereMember,
  getLeagueById,
  getLeagueIdBySlug,
} from "~/server/api/league/league.repository";
import { getOngoingSeason } from "~/server/api/season/season.repository";
import { populateSeasonUserPlayer } from "~/server/api/season/season.util";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import {
  createCuid,
  leaguePlayers,
  leagues,
  seasonPlayers,
  seasons,
} from "~/server/db/schema";
import { type Db } from "~/server/db/types";
import { slugifySeasonName } from "../common/slug";
import { create } from "./season.schema";

const getSeason = async ({
  seasonId,
  userId,
}: {
  seasonId: string;
  userId: string;
}) => {
  const season = await db.query.seasons.findFirst({
    where: eq(seasons.id, seasonId),
  });
  if (!season) {
    throw new TRPCError({ code: "NOT_FOUND", message: "season not found" });
  }

  const league = await db.query.leagues.findFirst({
    where: and(
      canReadLeaguesCriteria({ userId }),
      eq(leagues.id, season?.leagueId)
    ),
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
  }
) => {
  const ongoingSeason = await db.query.seasons.findFirst({
    where: and(
      eq(seasons.leagueId, input.leagueId),
      gte(seasons.endDate, input.startDate),
      input?.endDate ? lte(seasons.startDate, input?.endDate) : sql`true`
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
    .input(z.object({ seasonId: z.string() }))
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
  getOngoing: protectedProcedure
    .input(
      z.object({
        leagueSlug: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const leagueId = await getLeagueIdBySlug({
        userId: ctx.auth.userId,
        slug: input.leagueSlug,
      });
      const ongoingSeason = await getOngoingSeason({ leagueId });
      if (!ongoingSeason) {
        throw new TRPCError({ code: "NOT_FOUND", message: "season not found" });
      }
      return ongoingSeason;
    }),
  getAll: protectedProcedure
    .input(
      z.object({
        leagueSlug: z.string(),
        pageQuery: pageQuerySchema,
      })
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
            canReadLeaguesCriteria({ userId: ctx.auth.userId })
          )
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
      })
    )
    .query(async ({ input, ctx }) => {
      const season = await getSeason({
        seasonId: input.seasonId,
        userId: ctx.auth.userId,
      });

      const seasonPlayerResult = await ctx.db.query.seasonPlayers.findMany({
        where: eq(seasonPlayers.seasonId, season.id),
        with: {
          leaguePlayer: {
            columns: { userId: true },
          },
        },
        orderBy: desc(seasonPlayers.elo),
      });
      return populateSeasonUserPlayer({ seasonPlayers: seasonPlayerResult });
    }),
  create: protectedProcedure.input(create).mutation(async ({ ctx, input }) => {
    const leagueId = await getLeagueIdBySlug({
      userId: ctx.auth.userId,
      slug: input.leagueSlug,
    });
    if (input.endDate && input.startDate.getTime() >= input.endDate.getTime()) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "endDate has to be after startDate",
      });
    }
    const league = await getByIdWhereMember({
      leagueId,
      userId: ctx.auth.userId,
      allowedRoles: ["owner", "editor"],
    });

    if (!league) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    await checkOngoing(ctx.db, {
      leagueId,
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
        leagueId,
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
      where: and(
        eq(leaguePlayers.leagueId, leagueId),
        eq(leaguePlayers.disabled, false)
      ),
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
        seasonId: z.string().nonempty(),
      })
    )
    .query(async ({ ctx, input }) => {
      const season = await getSeason({
        seasonId: input.seasonId,
        userId: ctx.auth.userId,
      });

      const playerMatches = await ctx.db.query.seasonPlayers.findMany({
        columns: { id: true },
        where: eq(seasonPlayers.seasonId, season.id),
        with: {
          matches: {
            orderBy: (match, { asc }) => [asc(match.createdAt)],
            limit: 5,
            with: { match: true },
          },
        },
      });

      return playerMatches.map((pm) => {
        const form = pm.matches.map((m) => {
          if (m.match.homeScore === m.match.awayScore) {
            return "D";
          } else if (
            (m.match.homeScore > m.match.awayScore && m.homeTeam) ||
            (m.match.awayScore > m.match.homeScore && !m.homeTeam)
          ) {
            return "W";
          } else {
            return "L";
          }
        });
        return { seasonPlayerId: pm.id, form };
      });
    }),
});
