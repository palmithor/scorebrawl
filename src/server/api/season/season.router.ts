import z from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { pageQuerySchema } from "~/server/api/common/pagination";
import {
  canReadLeaguesCriteria,
  getByIdWhereMember,
} from "~/server/api/league/league.repository";
import { TRPCError } from "@trpc/server";
import {
  createCuid,
  leaguePlayers,
  leagues,
  seasonPlayers,
  seasons,
} from "~/server/db/schema";
import { type Db } from "~/server/db/types";
import { and, eq, lte, gte, sql, desc } from "drizzle-orm";
import { slugifyName } from "~/server/api/common/slug";

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
  getAll: protectedProcedure
    .input(
      z.object({
        leagueId: z.string(),
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
            eq(seasons.leagueId, input.leagueId),
            canReadLeaguesCriteria({ db: ctx.db, userId: ctx.auth.userId })
          )
        )
        .orderBy(desc(seasons.startDate))
        .all();

      return {
        data: result.map((r) => r.season),
        nextCursor: undefined,
      };
    }),
  table: protectedProcedure
    .input(
      z.object({
        seasonId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const season = await ctx.db.query.seasons.findFirst({
        where: eq(seasons.id, input.seasonId),
      });
      if (!season) {
        throw new TRPCError({ code: "NOT_FOUND", message: "season not found" });
      }

      return ctx.db.query.seasonPlayers.findMany({
        where: and(
          eq(seasons.id, season.id),
          canReadLeaguesCriteria({ db: ctx.db, userId: ctx.auth.userId })
        ),
        orderBy: desc(seasonPlayers.elo),
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
      await checkOngoing(ctx.db, input);

      const nameSlug = await slugifyName({ table: seasons, name: input.name });
      const now = new Date();
      const season = await ctx.db
        .insert(seasons)
        .values({
          id: createCuid(),
          name: input.name,
          nameSlug,
          leagueId: input.leagueId,
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
          eq(leaguePlayers.leagueId, input.leagueId),
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
});
