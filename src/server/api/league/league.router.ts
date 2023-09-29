import clerk from "@clerk/clerk-sdk-node";
import { TRPCError } from "@trpc/server";
import { and, asc, eq, gte, inArray, isNull, or, sql } from "drizzle-orm";
import z from "zod";
import { pageQuerySchema } from "~/server/api/common/pagination";
import { slugifyLeagueName } from "~/server/api/common/slug";
import { createTRPCRouter, leagueProcedure, protectedProcedure } from "~/server/api/trpc";
import { type LeaguePlayerUser, type PlayerForm } from "~/server/api/types";
import {
  createCuid,
  leagueEvents,
  leagueMembers,
  leaguePlayers,
  leagues,
  matches,
  seasonPlayers,
  seasons,
} from "~/server/db/schema";
import { type LeaguePlayer, type PlayerJoinedEventData } from "~/server/db/types";
import { canReadLeaguesCriteria, getByIdWhereMember } from "./league.repository";
import { create } from "./league.schema";

const populateLeagueUserPlayer = async ({ leaguePlayers }: { leaguePlayers: LeaguePlayer[] }) => {
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
      }),
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
  getBySlug: leagueProcedure
    .input(z.object({ leagueSlug: z.string().nonempty() }))
    .query(({ ctx }) => (({ ["code"]: _, ...rest }) => rest)(ctx.league)),
  getPlayers: leagueProcedure
    .input(z.object({ leagueSlug: z.string().nonempty() }))
    .query(async ({ ctx }) => {
      const leaguePlayerResult = await ctx.db.query.leaguePlayers.findMany({
        where: eq(leaguePlayers.leagueId, ctx.league.id),
      });

      return populateLeagueUserPlayer({ leaguePlayers: leaguePlayerResult });
    }),
  create: protectedProcedure.input(create).mutation(async ({ ctx, input }) => {
    const slug = await slugifyLeagueName({ name: input.name });
    const now = new Date();
    const league = await ctx.db.transaction(async (tx) => {
      const league = await tx
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
      await tx
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

      await tx
        .insert(leaguePlayers)
        .values({
          id: createCuid(),
          leagueId: league.id,
          userId: ctx.auth.userId,
          createdAt: now,
          updatedAt: now,
        })
        .run();
      return league;
    });
    return ctx.db.query.leagues.findFirst({
      where: eq(leagues.id, league.id),
      columns: { code: false },
    });
  }),
  getCode: leagueProcedure
    .input(
      z.object({
        leagueSlug: z.string().nonempty(),
      }),
    )
    .query(async ({ ctx }) => {
      if (ctx.league.visibility === "private") {
        const leagueAsMember = await getByIdWhereMember({
          leagueId: ctx.league.id,
          userId: ctx.auth.userId,
          allowedRoles: ["owner", "editor"],
        });
        if (!leagueAsMember) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
      }
      return ctx.league.code;
    }),
  update: leagueProcedure
    .input(
      z.object({
        leagueSlug: z.string().nonempty(),
        name: z.string().nonempty(),
        logoUrl: z.string().url(),
        visibility: z.enum(["public", "private"]),
        archived: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const league = await getByIdWhereMember({
        leagueId: ctx.league.id,
        userId: ctx.auth.userId,
        allowedRoles: ["owner", "editor"],
      });
      if (!league) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const slug = input.name ? await slugifyLeagueName({ name: input.name }) : undefined;
      return ctx.db
        .update(leagues)
        .set({
          archived: input.archived,
          visibility: input.visibility,
          name: input.name,
          slug,
          logoUrl: input.logoUrl,
        })
        .where(eq(leagues.id, ctx.league.id))
        .returning()
        .get();
    }),
  hasEditorAccess: leagueProcedure
    .input(
      z.object({
        leagueSlug: z.string().nonempty(),
      }),
    )
    .query(async ({ ctx }) => {
      const league = await getByIdWhereMember({
        leagueId: ctx.league.id,
        userId: ctx.auth.userId,
        allowedRoles: ["owner", "editor"],
      });

      return !!league;
    }),
  getBestForm: leagueProcedure
    .input(
      z.object({
        leagueSlug: z.string().nonempty(),
      }),
    )
    .query(async ({ ctx }) => {
      const data = await ctx.db.query.leagues.findFirst({
        where: (league, { eq }) => eq(league.id, ctx.league.id),
        with: {
          seasons: {
            orderBy: (season, { desc }) => [desc(season.startDate)],
            columns: { startDate: true },
            with: {
              seasonPlayers: {
                with: {
                  leaguePlayer: { columns: { userId: true } },
                  matches: {
                    columns: { homeTeam: true, createdAt: true },
                    orderBy: (match, { asc }) => [asc(match.createdAt)],
                    limit: 5,
                    with: {
                      match: {
                        columns: { homeScore: true, awayScore: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (data) {
        type FormAndPoints = { points: number; form: PlayerForm };
        const userFormAndPoints = data.seasons
          .flatMap((season) =>
            season.seasonPlayers.map((player) => ({
              userId: player.leaguePlayer.userId,
              matches: player.matches,
            })),
          )
          .reduce<Record<string, FormAndPoints>>((acc, player) => {
            const { userId, matches } = player;
            const currentPointsAndForm = matches.reduce<FormAndPoints>(
              (pointsAndForm, match) => {
                if (match.match.awayScore === match.match.homeScore) {
                  return {
                    points: pointsAndForm.points + 1,
                    form: [...(pointsAndForm.form ?? []), "D"],
                  };
                } else if (
                  (match.match.awayScore < match.match.homeScore && match.homeTeam) ||
                  (match.match.awayScore > match.match.homeScore && !match.homeTeam)
                ) {
                  return {
                    points: pointsAndForm.points + 3,
                    form: [...(pointsAndForm.form ?? []), "W"],
                  };
                } else {
                  return {
                    points: pointsAndForm.points,
                    form: [...(pointsAndForm.form ?? []), "L"],
                  };
                }
              },
              { points: 0, form: [] },
            );
            const accPoints = acc[userId];
            if (accPoints) {
              acc[userId] = {
                points: accPoints.points + currentPointsAndForm.points,
                form: [...accPoints.form, ...currentPointsAndForm.form],
              };
            } else {
              acc[userId] = currentPointsAndForm;
            }
            return acc;
          }, {});

        let bestForm: {
          userId: string;
          form: PlayerForm;
          points: number;
        } = { userId: "", points: -1, form: [] };
        for (const userId of Object.keys(userFormAndPoints)) {
          const user = userFormAndPoints[userId];
          if (user && user.points > bestForm.points) {
            bestForm = { userId, points: user.points, form: user.form };
          }
        }
        const clerkUser = await clerk.users.getUser(bestForm.userId);
        return {
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
          imageUrl: clerkUser.imageUrl,
          points: bestForm.points,
          form: bestForm.form,
        };
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Should not happen as the league id has been found already",
      });
    }),
  join: protectedProcedure
    .input(
      z.object({
        code: z.string().nonempty(),
      }),
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
      await ctx.db.transaction(async (tx) => {
        await tx
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

        const leaguePlayer = await tx
          .insert(leaguePlayers)
          .values({
            id: createCuid(),
            userId: ctx.auth.userId,
            leagueId: league.id,
            createdAt: now,
            updatedAt: now,
          })
          .onConflictDoNothing()
          .returning()
          .get();

        const ongoingAndFutureSeasons = await tx.query.seasons.findMany({
          where: and(
            eq(seasons.leagueId, league.id),
            or(isNull(seasons.endDate), gte(seasons.endDate, now)),
          ),
        });
        for (const season of ongoingAndFutureSeasons) {
          await tx
            .insert(seasonPlayers)
            .values({
              id: createCuid(),
              leaguePlayerId: leaguePlayer.id,
              elo: season.initialElo,
              seasonId: season.id,
              createdAt: now,
              updatedAt: now,
            })
            .onConflictDoNothing()
            .run();
        }

        await tx
          .insert(leagueEvents)
          .values({
            id: createCuid(),
            leagueId: league.id,
            type: "player_joined_v1",
            data: {
              leaguePlayerId: leaguePlayer.id,
            } as PlayerJoinedEventData,
            createdBy: ctx.auth.userId,
            createdAt: now,
          })
          .run();
      });
      return league;
    }),
  getMatchesPlayedStats: leagueProcedure
    .input(
      z.object({
        leagueSlug: z.string().nonempty(),
      }),
    )
    .query(async ({ ctx }) => {
      return ctx.db
        .select({
          count: sql<number>`count(*)`,
          seasonCount: sql<number>`count( distinct (${matches.seasonId}))`,
        })
        .from(matches)
        .where(
          and(
            inArray(
              matches.seasonId,
              ctx.db
                .select({ id: seasons.id })
                .from(seasons)
                .where(eq(seasons.leagueId, ctx.league.id)),
            ),
          ),
        )
        .get();
    }),
  getEvents: leagueProcedure
    .input(
      z.object({
        leagueSlug: z.string().nonempty(),
      }),
    )
    .query(async ({ ctx }) =>
      ctx.db.query.leagueEvents.findMany({
        where: (event, { eq }) => eq(event.leagueId, ctx.league.id),
      }),
    ),
});
