import z from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getCursor, pageQuerySchema } from "~/server/api/common/pagination";
import slugify from "@sindresorhus/slugify";
import { TRPCError } from "@trpc/server";
import type { League } from "@prisma/client";

export const leagueRouter = createTRPCRouter({
  getAllLeagues: protectedProcedure
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
            { isPrivate: false },
          ],
        },
        orderBy: { id: "desc" },
      });

      return {
        data: result.map((l) => (l.isPrivate ? excludeCode(l) : l)),
        nextCursor: result[limit - 1]?.id,
      };
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().nonempty(),
        logoUrl: z.string().url(),
        isPrivate: z.boolean().default(false),
        initialElo: z.number().int().min(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const doesLeagueSlugExists = async (nameSlug: string) =>
        ctx.prisma.league.findUnique({ where: { nameSlug } });
      const rootNameSlug = slugify(input.name);
      let nameSlug = rootNameSlug;
      let leagueSlugExists = await doesLeagueSlugExists(nameSlug);
      let counter = 1;
      while (leagueSlugExists) {
        nameSlug = `${rootNameSlug}-${counter}`;
        counter++;
        leagueSlugExists = await doesLeagueSlugExists(nameSlug);
      }

      const league = await ctx.prisma.league.create({
        data: {
          nameSlug,
          name: input.name,
          initialElo: input.initialElo,
          logoUrl: input.logoUrl,
          isPrivate: input.isPrivate,
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
  joinLeague: protectedProcedure
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
      await ctx.prisma.leaguePlayer.create({
        data: {
          userId: ctx.auth.userId,
          leagueId: league.id,
        },
      });
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
