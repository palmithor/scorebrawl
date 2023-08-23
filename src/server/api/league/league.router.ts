import clerk from "@clerk/clerk-sdk-node";
import { TRPCError } from "@trpc/server";
import { and, asc, eq, gte, isNull, or } from "drizzle-orm";
import z from "zod";
import { pageQuerySchema } from "~/server/api/common/pagination";
import { slugifyLeagueName } from "~/server/api/common/slug";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { type LeaguePlayerUser } from "~/server/api/types";
import {
  createCuid,
  leagueMembers,
  leaguePlayers,
  leagues,
  seasonPlayers,
  seasons,
} from "~/server/db/schema";
import { type LeagueModel, type LeaguePlayer } from "~/server/db/types";
import {
  canReadLeaguesCriteria,
  getByIdWhereMember,
  getLeagueIdBySlug,
} from "./league.repository";
import { create } from "./league.schema";

const populateLeagueUserPlayer = async ({
  leaguePlayers,
}: {
  leaguePlayers: LeaguePlayer[];
}) => {
  const clerkUsers = await clerk.users.getUserList({
    limit: leaguePlayers.length,
    userId: leaguePlayers.map((p) => p.userId),
  });
  return leaguePlayers
    .map((leaguePlayer) => {
      const user = clerkUsers.find((user) => user.id === leaguePlayer.userId);

      if (user) {
        return {
          id: leaguePlayer.id,
          userId: user.id,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          imageUrl: user.imageUrl,
          joinedAt: leaguePlayer.createdAt,
          disabled: leaguePlayer.disabled,
        };
      }
    })
    .filter((item): item is LeaguePlayerUser => !!item);
};

export const leagueRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        pageQuery: pageQuerySchema,
      })
    )
    .query(async ({ ctx }) => {
      const dbResult = await ctx.db.query.leagues.findMany({
        columns: { code: false },
        where: canReadLeaguesCriteria({ userId: ctx.auth.userId }),
        orderBy: asc(leagues.slug),
      });

      return {
        data: dbResult,
      };
    }),
  getBySlug: protectedProcedure
    .input(z.object({ leagueSlug: z.string().nonempty() }))
    .query(async ({ input, ctx }) => {
      const league = await ctx.db.query.leagues.findFirst({
        where: and(
          eq(leagues.slug, input.leagueSlug),
          canReadLeaguesCriteria({ userId: ctx.auth.userId })
        ),
      });
      if (!league) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { code, ...publicLeagueProps } = league;
      return publicLeagueProps;
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

      return populateLeagueUserPlayer({ leaguePlayers: leaguePlayerResult });
    }),
  create: protectedProcedure.input(create).mutation(async ({ ctx, input }) => {
    const slug = await slugifyLeagueName({ name: input.name });
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
    return ctx.db.query.leagues.findFirst({
      where: eq(leagues.id, league.id),
      columns: { code: false },
    });
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
        ? await slugifyLeagueName({ name: input.name })
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
        leagueSlug: z.string().nonempty(),
      })
    )
    .query(async ({ ctx, input }) => {
      const league = await ctx.db.query.leagues.findFirst({
        where: eq(leagues.slug, input.leagueSlug),
      });
      if (!league) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (league.visibility === "private") {
        const leagueAsMember = await getByIdWhereMember({
          leagueId: league.id,
          userId: ctx.auth.userId,
          allowedRoles: ["owner", "editor"],
        });
        if (!leagueAsMember) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
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
      const leagueId = await getLeagueIdBySlug({
        slug: input.leagueSlug,
        userId: ctx.auth.userId,
      });

      const league = await getByIdWhereMember({
        leagueId,
        userId: ctx.auth.userId,
        allowedRoles: ["owner", "editor"],
      });

      return !!league;
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
      const ongoingAndFutureSeasons = await ctx.db.query.seasons.findMany({
        where: and(
          eq(seasons.leagueId, league.id),
          or(isNull(seasons.endDate), gte(seasons.endDate, now))
        ),
      });

      for (const season of ongoingAndFutureSeasons) {
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
