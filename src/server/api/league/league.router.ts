import z from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getCursor, pageQuerySchema } from "~/server/api/common/pagination";
import slugify from "@sindresorhus/slugify";
import { TRPCError } from "@trpc/server";
import type { League, PrismaClient } from "@prisma/client";
import { getByIdWhereMember } from "./league.repository";

const createSlug = async (prisma: PrismaClient, name: string) => {
  const doesLeagueSlugExists = async (nameSlug: string) =>
    prisma.league.findUnique({ where: { nameSlug } });
  const rootNameSlug = slugify(name, {
    customReplacements: [
      ["þ", "th"],
      ["Þ", "th"],
      ["ð", "d"],
      ["Ð", "d"],
    ],
  });
  let nameSlug = rootNameSlug;
  let leagueSlugExists = await doesLeagueSlugExists(nameSlug);
  let counter = 1;
  while (leagueSlugExists) {
    nameSlug = `${rootNameSlug}-${counter}`;
    counter++;
    leagueSlugExists = await doesLeagueSlugExists(nameSlug);
  }
  return nameSlug;
};

export const leagueRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        pageQuery: pageQuerySchema,
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.pageQuery.limit;
      const result = await ctx.prisma.league.findMany({
        take: input.pageQuery.limit,
        cursor: getCursor(input.pageQuery),
        where: {
          OR: [
            {
              members: {
                some: {
                  userId: ctx.auth.userId,
                },
              },
            },
            {
              visibility: "public",
            },
          ],
        },
        orderBy: { id: "desc" },
      });

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
      const nameSlug = await createSlug(ctx.prisma, input.name);

      const league = await ctx.prisma.league.create({
        data: {
          nameSlug,
          name: input.name,
          logoUrl: input.logoUrl,
          visibility: input.visibility,
          updatedBy: ctx.auth.userId,
          createdBy: ctx.auth.userId,
        },
      });
      await ctx.prisma.leagueMember.create({
        data: {
          leagueId: league.id,
          userId: ctx.auth.userId,
          role: "owner",
        },
      });
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
      const season = await ctx.prisma.league.findUnique({
        where: { id: input.leagueId },
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
        ? await createSlug(ctx.prisma, input.name)
        : undefined;
      await ctx.prisma.league.update({
        where: { id: input.leagueId },
        data: {
          archived: input.archived,
          visibility: input.visibility,
          name: input.name,
          nameSlug: nameSlug,
          logoUrl: input.logoUrl,
        },
      });
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
      const league = await ctx.prisma.league.findUnique({
        where: { code: input.code },
      });
      if (!league) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "League not found",
        });
      }
      await ctx.prisma.leagueMember.create({
        data: {
          userId: ctx.auth.userId,
          leagueId: league.id,
          role: "member",
        },
      });
      const leaguePlayer = await ctx.prisma.leaguePlayer.create({
        data: {
          userId: ctx.auth.userId,
          leagueId: league.id,
        },
      });
      const now = new Date();
      const ongoingSeasons = await ctx.prisma.season.findMany({
        select: { id: true, initialElo: true },
        where: {
          leagueId: league.id,
          startDate: {
            lte: now,
          },
          endDate: {
            gte: now,
          },
        },
      });
      for (const season of ongoingSeasons) {
        await ctx.prisma.seasonPlayer.create({
          data: {
            leaguePlayerId: leaguePlayer.id,
            elo: season.initialElo,
            seasonId: season.id,
          },
        });
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
