import z from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { pageQuerySchema } from "~/server/api/common/pagination";
import { TRPCError } from "@trpc/server";
import {
  canReadLeaguesCriteria,
  findLeagueIdBySlug,
  getByIdWhereMember,
  getLeagueIdBySlug,
} from "./league.repository";
import {
  createCuid,
  leagueMembers,
  leaguePlayers,
  leagues,
  seasonPlayers,
} from "~/server/db/schema";
import { eq, asc } from "drizzle-orm";
import { type LeaguePlayer, type LeagueModel } from "~/server/db/types";
import { slugifyName } from "~/server/api/common/slug";
import { create } from "./league.schema";
import clerk, { type User } from "@clerk/clerk-sdk-node";
import { getOngoingSeason } from "~/server/api/season/season.repository";

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
        .where(canReadLeaguesCriteria({ userId: ctx.auth.userId }))
        .limit(input.pageQuery.limit)
        .orderBy(asc(leagues.slug))
        .all();

      return {
        data: result.map((l) =>
          l.visibility == "private" ? excludeCode(l) : l
        ),
        nextCursor: result[limit - 1]?.id,
      };
    }),
  getBySlug: protectedProcedure
    .input(z.object({ leagueSlug: z.string().nonempty() }))
    .query(async ({ input, ctx }) => {
      const league = await ctx.db.query.leagues.findFirst({
        where: eq(leagues.slug, input.leagueSlug),
      });
      if (!league) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (league.visibility === "private") {
        const privateLeague = await getByIdWhereMember({
          leagueId: league.id,
          userId: ctx.auth.userId,
        });
        if (!privateLeague) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
      }
      return league;
    }),
  getPlayers: protectedProcedure
    .input(z.object({ leagueSlug: z.string().nonempty() }))
    .query(async ({ ctx, input }) => {
      const leagueId = await getLeagueIdBySlug({
        userId: ctx.auth.userId,
        slug: input.leagueSlug,
      });
      const leaguePlayerResult = await ctx.db.query.leaguePlayers.findMany({
        where: eq(leaguePlayers.leagueId, leagueId),
      });

      const clerkUsers = await clerk.users.getUserList({
        limit: leaguePlayerResult.length,
        userId: leaguePlayerResult.map((p) => p.userId),
      });

      return leaguePlayerResult
        .map((leaguePlayer) => {
          const userId = leaguePlayer.userId;
          const user = clerkUsers.find((user) => user.id === userId);

          if (user) {
            return { leaguePlayer, user };
          }
        })
        .filter(Boolean) as { user: User; leaguePlayer: LeaguePlayer }[];
    }),
  create: protectedProcedure.input(create).mutation(async ({ ctx, input }) => {
    const slug = await slugifyName({ table: leagues, name: input.name });
    const now = new Date();
    const league = await ctx.db
      .insert(leagues)
      .values({
        id: createCuid(),
        slug,
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
      const slug = input.name
        ? await slugifyName({ table: leagues, name: input.name })
        : undefined;
      return ctx.db
        .update(leagues)
        .set({
          archived: input.archived,
          visibility: input.visibility,
          name: input.name,
          slug,
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
  hasEditorAccess: protectedProcedure
    .input(
      z.object({
        leagueSlug: z.string().nonempty(),
      })
    )
    .query(async ({ ctx, input }) => {
      const leagueId = await findLeagueIdBySlug({
        slug: input.leagueSlug,
        userId: ctx.auth.userId,
      });
      const league = await getByIdWhereMember({
        leagueId,
        userId: ctx.auth.userId,
        allowedRoles: ["owner", "editor"],
      });

      return league ? true : false;
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
        .onConflictDoNothing()
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
      const ongoingSeason = await getOngoingSeason({ leagueId: league.id });

      await ctx.db
        .insert(seasonPlayers)
        .values({
          id: createCuid(),
          leaguePlayerId: leaguePlayer.id,
          elo: ongoingSeason.initialElo,
          seasonId: ongoingSeason.id,
          createdAt: now,
          updatedAt: now,
        })
        .run();
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

const excludeCode = (l: LeagueModel): Omit<LeagueModel, "code"> =>
  exclude(l, ["code"]);
