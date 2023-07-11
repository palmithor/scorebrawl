import z from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { pageQuerySchema } from "~/server/api/common/pagination";
import { TRPCError } from "@trpc/server";
import {
  canReadLeaguesCriteria,
  getByIdWhereMember,
} from "./league.repository";
import {
  createCuid,
  leagueMembers,
  leaguePlayers,
  leagues,
  seasonPlayers,
  seasons,
} from "~/server/db/schema";
import { and, eq, asc, lte, gte } from "drizzle-orm";
import { type League } from "~/server/db/types";
import { slugifyName } from "~/server/api/common/slug";

export const leagueRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        pageQuery: pageQuerySchema,
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.pageQuery.limit;
      const result = await ctx.db
        .select()
        .from(leagues)
        .where(canReadLeaguesCriteria({ db: ctx.db, userId: ctx.auth.userId }))
        .limit(input.pageQuery.limit)
        .orderBy(asc(leagues.nameSlug))
        .all();

      return {
        data: result.map((l) =>
          l.visibility == "private" ? excludeCode(l) : l
        ),
        nextCursor: result[limit - 1]?.id,
      };
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().nonempty(),
        logoUrl: z.string().url(),
        visibility: z.enum(["public", "private"]).default("public"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const nameSlug = await slugifyName({ table: leagues, name: input.name });
      const now = new Date();
      const league = await ctx.db
        .insert(leagues)
        .values({
          id: createCuid(),
          nameSlug,
          name: input.name,
          logoUrl: input.logoUrl,
          visibility: input.visibility,
          code: createCuid(),
          updatedBy: ctx.auth.userId,
          createdBy: ctx.auth.userId,
          createdAt: now,
          updatedAt: now,
        })
        .returning()
        .get();
      await ctx.db
        .insert(leagueMembers)
        .values({
          id: createCuid(),
          leagueId: league.id,
          userId: ctx.auth.userId,
          role: "owner",
          createdAt: now,
          updatedAt: now,
        })
        .run();
      return excludeCode(league);
    }),
  update: protectedProcedure
    .input(
      z.object({
        leagueId: z.string().nonempty(),
        name: z.string().nonempty(),
        logoUrl: z.string().url(),
        visibility: z.enum(["public", "private"]),
        archived: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const season = await ctx.db.query.leagues.findFirst({
        where: eq(leagues.id, input.leagueId),
      });
      if (!season) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const league = await getByIdWhereMember({
        leagueId: input.leagueId,
        userId: ctx.auth.userId,
        allowedRoles: ["owner", "editor"],
      });
      if (!league) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const nameSlug = input.name
        ? await slugifyName({ table: leagues, name: input.name })
        : undefined;
      return ctx.db
        .update(leagues)
        .set({
          archived: input.archived,
          visibility: input.visibility,
          name: input.name,
          nameSlug: nameSlug,
          logoUrl: input.logoUrl,
        })
        .where(eq(leagues.id, input.leagueId))
        .returning()
        .get();
    }),
  getCode: protectedProcedure
    .input(
      z.object({
        leagueId: z.string().nonempty(),
      })
    )
    .query(async ({ ctx, input }) => {
      const league = await getByIdWhereMember({
        leagueId: input.leagueId,
        userId: ctx.auth.userId,
        allowedRoles: ["owner", "editor"],
      });
      if (!league) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return { code: league.code };
    }),
  join: protectedProcedure
    .input(
      z.object({
        code: z.string().nonempty(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const league = await ctx.db.query.leagues.findFirst({
        where: eq(leagues.code, input.code),
      });
      if (!league) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "League not found",
        });
      }
      const now = new Date();
      await ctx.db
        .insert(leagueMembers)
        .values({
          id: createCuid(),
          userId: ctx.auth.userId,
          leagueId: league.id,
          role: "member",
          createdAt: now,
          updatedAt: now,
        })
        .run();
      const leaguePlayer = await ctx.db
        .insert(leaguePlayers)
        .values({
          id: createCuid(),
          userId: ctx.auth.userId,
          leagueId: league.id,
          createdAt: now,
          updatedAt: now,
        })
        .returning()
        .get();
      const ongoingSeasons = await ctx.db.query.seasons.findMany({
        columns: { id: true, initialElo: true },
        where: and(
          eq(seasons.leagueId, league.id),
          gte(seasons.startDate, now),
          lte(seasons.endDate, now)
        ),
      });

      for (const season of ongoingSeasons) {
        await ctx.db
          .insert(seasonPlayers)
          .values({
            id: createCuid(),
            leaguePlayerId: leaguePlayer.id,
            elo: season.initialElo,
            seasonId: season.id,
            createdAt: now,
            updatedAt: now,
          })
          .run();
      }
    }),
});

function exclude<League, Key extends keyof League>(
  league: League,
  keys: Key[]
): Omit<League, Key> {
  for (const key of keys) {
    delete league[key];
  }
  return league;
}

const excludeCode = (l: League): Omit<League, "code"> => exclude(l, ["code"]);
