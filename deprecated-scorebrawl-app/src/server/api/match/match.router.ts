import { Player, TeamMatch } from "@ihs7/ts-elo";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import z from "zod";
import { pageQuerySchema } from "~/server/api/common/pagination";
import { create } from "~/server/api/match/match.schema";
import { getSeasonById } from "~/server/api/season/season.repository";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import {
  createCuid,
  leagueTeamPlayers,
  leagueTeams,
  matchPlayers,
  matches,
  seasonPlayers,
  seasonTeams,
  teamMatches,
} from "~/server/db/schema";
import { type DbTransaction } from "~/server/db/types";
import {
  getByIdWhereMember,
  getLeagueById,
  getLeagueBySlug,
  getLeagueIdBySlug,
} from "../league/league.repository";

const toResponse = (match: {
  id: string;
  homeScore: number;
  awayScore: number;
  homeExpectedElo: number;
  awayExpectedElo: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  matchPlayers: {
    homeTeam: boolean;
    seasonPlayer: {
      id: string;
      elo: number;
      createdAt: Date;
      disabled: boolean;
      leaguePlayer: {
        userId: string;
        user: { name: string | null; imageUrl: string | null };
      };
    };
  }[];
}) => ({
  id: match.id,
  homeTeam: {
    score: match.homeScore,
    expectedElo: match.homeExpectedElo,
    players: match.matchPlayers
      .filter((p) => p.homeTeam)
      .map((p) => ({
        id: p.seasonPlayer.id,
        userId: p.seasonPlayer.leaguePlayer.userId,
        elo: p.seasonPlayer.elo,
        joinedAt: p.seasonPlayer.createdAt,
        disabled: p.seasonPlayer.disabled,
        name: p.seasonPlayer.leaguePlayer.user?.name ?? "",
        imageUrl: p.seasonPlayer.leaguePlayer.user?.imageUrl ?? "",
      })),
  },
  awayTeam: {
    score: match.awayScore,
    expectedElo: match.awayExpectedElo,
    players: match.matchPlayers
      .filter((p) => !p.homeTeam)
      .map((p) => ({
        id: p.seasonPlayer.id,
        userId: p.seasonPlayer.leaguePlayer.userId,
        elo: p.seasonPlayer.elo,
        joinedAt: p.seasonPlayer.createdAt,
        disabled: p.seasonPlayer.disabled,
        name: p.seasonPlayer.leaguePlayer.user?.name ?? "",
        imageUrl: p.seasonPlayer.leaguePlayer.user?.imageUrl ?? "",
      })),
  },
  createdBy: match.createdBy,
  updatedBy: match.updatedBy,
  createdAt: match.createdAt,
  updatedAt: match.updatedAt,
});

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
              seasonPlayer: {
                with: {
                  leaguePlayer: {
                    columns: { userId: true },
                    with: { user: { columns: { name: true, imageUrl: true } } },
                  },
                },
              },
            },
          },
        },
      });
      return {
        data: seasonMatches.map(toResponse),
        nextCursor: undefined,
      };
    }),
  getById: protectedProcedure
    .input(
      z.object({
        matchId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const match = await ctx.db.query.matches.findFirst({
        where: (match, { eq }) => eq(match.id, input.matchId),
        with: {
          season: {
            columns: { id: true, name: true },
            with: {
              league: {
                columns: { slug: true },
              },
            },
          },
          matchPlayers: {
            with: {
              seasonPlayer: {
                with: {
                  leaguePlayer: {
                    columns: { userId: true },
                    with: { user: { columns: { name: true, imageUrl: true } } },
                  },
                },
              },
            },
          },
        },
      });
      if (!match) {
        throw new TRPCError({ message: "Match not found", code: "NOT_FOUND" });
      }

      // check access
      await getLeagueBySlug({
        userId: ctx.auth.userId,
        slug: match.season.league.slug,
      });

      return {
        id: match.id,
        homeTeam: {
          score: match.homeScore,
          expectedElo: match.homeExpectedElo,
          players: match.matchPlayers
            .filter((p) => p.homeTeam)
            .map((p) => ({
              id: p.seasonPlayer.id,
              userId: p.seasonPlayer.leaguePlayer.userId,
              elo: p.seasonPlayer.elo,
              joinedAt: p.seasonPlayer.createdAt,
              disabled: p.seasonPlayer.disabled,
              name: p.seasonPlayer.leaguePlayer.user.name,
              imageUrl: p.seasonPlayer.leaguePlayer.user.imageUrl,
            })),
        },
        awayTeam: {
          score: match.awayScore,
          expectedElo: match.awayExpectedElo,
          players: match.matchPlayers
            .filter((p) => !p.homeTeam)
            .map((p) => ({
              id: p.seasonPlayer.id,
              userId: p.seasonPlayer.leaguePlayer.userId,
              elo: p.seasonPlayer.elo,
              joinedAt: p.seasonPlayer.createdAt,
              disabled: p.seasonPlayer.disabled,
              name: p.seasonPlayer.leaguePlayer.user.name,
              imageUrl: p.seasonPlayer.leaguePlayer.user.imageUrl,
            })),
        },
        createdBy: match.createdBy,
        updatedBy: match.updatedBy,
        createdAt: match.createdAt,
        updatedAt: match.updatedAt,
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
                      seasonPlayer: {
                        with: {
                          leaguePlayer: {
                            columns: { userId: true },
                            with: {
                              user: { columns: { name: true, imageUrl: true } },
                            },
                          },
                        },
                      },
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

      const season = leagueMatches.seasons.find(
        (s) => s.id === latestMatchAcrossSeasons.seasonId,
      ) as { id: string; name: string };

      return {
        ...toResponse(latestMatchAcrossSeasons),
        season: { id: season.id, name: season.name },
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

    const awaySeasonPlayers = await getSeasonPlayers({
      seasonId: season.id,
      seasonPlayerIds: input.awayPlayerIds,
    });
    const homeSeasonPlayers = await getSeasonPlayers({
      seasonId: season.id,
      seasonPlayerIds: input.homePlayerIds,
    });

    const now = new Date();
    return ctx.db.transaction(async (tx) => {
      const {
        eloMatchResult: individualMatchResult,
        eloHomeTeam: individualHomeTeamElo,
        eloAwayTeam: individualAwayTeamElo,
      } = calculateMatchResult({
        kFactor: season.kFactor,
        homeScore: input.homeScore,
        awayScore: input.awayScore,
        homePlayers: homeSeasonPlayers,
        awayPlayers: awaySeasonPlayers,
      });

      const match = await tx
        .insert(matches)
        .values({
          id: createCuid(),
          homeScore: input.homeScore,
          awayScore: input.awayScore,
          homeExpectedElo: individualHomeTeamElo.expectedScoreAgainst(individualAwayTeamElo),
          awayExpectedElo: individualAwayTeamElo.expectedScoreAgainst(individualHomeTeamElo),
          seasonId: season.id,
          createdBy: ctx.auth.userId,
          updatedBy: ctx.auth.userId,
          createdAt: now,
          updatedAt: now,
        })
        .returning()
        .get();

      let homeTeamResult: "W" | "L" | "D" = "D";
      let awayTeamResult: "W" | "L" | "D" = "D";
      if (input.homeScore > input.awayScore) {
        homeTeamResult = "W";
        awayTeamResult = "L";
      } else if (input.homeScore < input.awayScore) {
        homeTeamResult = "L";
        awayTeamResult = "W";
      }

      const matchPlayerValues = [
        ...awaySeasonPlayers.map((player) => ({
          id: createCuid(),
          matchId: match.id,
          eloBefore: player.elo,
          eloAfter: individualMatchResult.results.find((r) => r.identifier === player.id)?.rating,
          seasonPlayerId: player.id,
          homeTeam: false,
          result: awayTeamResult,
          createdAt: now,
          updatedAt: now,
        })),
        ...homeSeasonPlayers.map((player) => ({
          id: createCuid(),
          matchId: match.id,
          eloBefore: player.elo,
          eloAfter: individualMatchResult.results.find((r) => r.identifier === player.id)?.rating,
          seasonPlayerId: player.id,
          homeTeam: true,
          result: homeTeamResult,
          createdAt: now,
          updatedAt: now,
        })),
      ];
      await tx.insert(matchPlayers).values(matchPlayerValues).run();

      for (const playerResult of individualMatchResult.results) {
        await tx
          .update(seasonPlayers)
          .set({ elo: playerResult.rating })
          .where(eq(seasonPlayers.id, playerResult.identifier))
          .run();
      }

      if (homeSeasonPlayers.length > 1 && awaySeasonPlayers.length > 1) {
        const { seasonTeamId: homeSeasonTeamId, elo: homeSeasonTeamElo } = await getOrInsertTeam(
          tx,
          {
            season,
            now,
            players: homeSeasonPlayers,
          },
        );
        const { seasonTeamId: awaySeasonTeamId, elo: awaySeasonTeamElo } = await getOrInsertTeam(
          tx,
          {
            season,
            now,
            players: awaySeasonPlayers,
          },
        );

        const { eloMatchResult: teamMatchResult } = calculateMatchResult({
          kFactor: season.kFactor,
          homeScore: input.homeScore,
          awayScore: input.awayScore,
          homePlayers: [{ id: homeSeasonTeamId, elo: homeSeasonTeamElo }],
          awayPlayers: [{ id: awaySeasonTeamId, elo: awaySeasonTeamElo }],
        });

        await tx
          .insert(teamMatches)
          .values([
            {
              id: createCuid(),
              matchId: match.id,
              seasonTeamId: homeSeasonTeamId,
              eloBefore: homeSeasonTeamElo,
              eloAfter: teamMatchResult.results.find((r) => r.identifier === homeSeasonTeamId)
                ?.rating,
              result: homeTeamResult,
              createdAt: now,
              updatedAt: now,
            },
            {
              id: createCuid(),
              matchId: match.id,
              seasonTeamId: awaySeasonTeamId,
              eloBefore: awaySeasonTeamElo,
              eloAfter: teamMatchResult.results.find((r) => r.identifier === awaySeasonTeamId)
                ?.rating,
              result: awayTeamResult,
              createdAt: now,
              updatedAt: now,
            },
          ])
          .run();

        for (const teamResult of teamMatchResult.results) {
          await tx
            .update(seasonTeams)
            .set({ elo: teamResult.rating })
            .where(eq(seasonTeams.id, teamResult.identifier))
            .run();
        }
      }

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
            with: {
              seasonPlayer: {
                columns: { id: true, elo: true, leaguePlayerId: true },
              },
            },
          },
          teamMatches: {
            columns: { id: true, eloBefore: true, seasonTeamId: true },
          },
          season: { columns: { id: true, leagueId: true } },
        },
      });
      if (!match) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Match not found" });
      }
      // check read access
      await getLeagueById({
        userId: ctx.auth.userId,
        id: match.season.leagueId,
      });

      const isLeaguePlayer = await ctx.db.query.leaguePlayers.findFirst({
        where: (lp, { and, eq }) =>
          and(
            eq(lp.leagueId, match.season.leagueId),
            eq(lp.userId, ctx.auth.userId),
            eq(lp.disabled, false),
          ),
      });

      if (!isLeaguePlayer) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User not part of league",
        });
      }

      const lastMatch = await ctx.db.query.matches.findFirst({
        where: (m, { eq }) => eq(m.seasonId, match.seasonId),
        orderBy: desc(matches.createdAt),
      });

      if (lastMatch?.id !== match.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the last match can be deleted",
        });
      }

      await ctx.db.transaction(async (tx) => {
        for (const matchPlayer of match.matchPlayers) {
          await tx
            .update(seasonPlayers)
            .set({ elo: matchPlayer.eloBefore })
            .where(eq(seasonPlayers.id, matchPlayer.seasonPlayer.id))
            .run();
        }
        for (const teamMatch of match.teamMatches) {
          await tx
            .update(seasonTeams)
            .set({ elo: teamMatch.eloBefore })
            .where(eq(seasonTeams.id, teamMatch.seasonTeamId))
            .run();
        }
        await tx.delete(matchPlayers).where(eq(matchPlayers.matchId, match.id)).run();
        await tx.delete(teamMatches).where(eq(teamMatches.matchId, match.id)).run();

        await tx.delete(matches).where(eq(matches.id, match.id)).run();
      });
    }),
});

const calculateMatchResult = ({
  kFactor,
  homeScore,
  awayScore,
  homePlayers,
  awayPlayers,
}: {
  kFactor: number;
  homeScore: number;
  awayScore: number;
  homePlayers: { id: string; elo: number }[];
  awayPlayers: { id: string; elo: number }[];
}) => {
  const eloIndividualMatch = new TeamMatch({ kFactor });
  const eloHomeTeam = eloIndividualMatch.addTeam("home", homeScore);
  for (const p of homePlayers) {
    eloHomeTeam.addPlayer(new Player(p.id, p.elo));
  }
  const eloAwayTeam = eloIndividualMatch.addTeam("away", awayScore);
  for (const p of awayPlayers) {
    eloAwayTeam.addPlayer(new Player(p.id, p.elo));
  }
  const eloMatchResult = eloIndividualMatch.calculate();
  return { eloHomeTeam, eloAwayTeam, eloMatchResult };
};

const getSeasonPlayers = async ({
  seasonId,
  seasonPlayerIds,
}: {
  seasonId: string;
  seasonPlayerIds: string[];
}) => {
  const players = await db.query.seasonPlayers.findMany({
    where: and(eq(seasonPlayers.seasonId, seasonId), inArray(seasonPlayers.id, seasonPlayerIds)),
    with: {
      leaguePlayer: {
        columns: { id: true },
        with: { user: { columns: { name: true } } },
      },
    },
  });
  if (players.length !== seasonPlayerIds.length) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "some players in home team not part of season",
    });
  }
  return players;
};

const getOrInsertTeam = async (
  tx: DbTransaction,
  {
    now,
    season,
    players,
  }: {
    now: Date;
    season: { id: string; initialElo: number; leagueId: string };
    players: { leaguePlayer: { id: string; user: { name: string } } }[];
  },
) => {
  const teamIdResult = await tx
    .select({ teamId: leagueTeamPlayers.teamId })
    .from(leagueTeamPlayers)
    .where(
      inArray(
        leagueTeamPlayers.leaguePlayerId,
        players.map((p) => p.leaguePlayer.id),
      ),
    )
    .groupBy(leagueTeamPlayers.teamId)
    .having(sql`COUNT(DISTINCT ${leagueTeamPlayers.leaguePlayerId}) = ${players.length}`)
    .get();

  let teamId = teamIdResult?.teamId;

  if (!teamId) {
    teamId = createCuid();
    await tx
      .insert(leagueTeams)
      .values({
        id: teamId,
        name: players.map((p) => p.leaguePlayer.user.name.split(" ")[0]).join(" & "),
        leagueId: season.leagueId,
        updatedAt: now,
        createdAt: now,
      })
      .run();

    await tx
      .insert(leagueTeamPlayers)
      .values(
        players.map((p) => ({
          id: createCuid(),
          teamId: teamId as string,
          leaguePlayerId: p.leaguePlayer.id,
          createdAt: now,
          updatedAt: now,
        })),
      )
      .run();

    const seasonTeamId = createCuid();
    await tx
      .insert(seasonTeams)
      .values({
        id: seasonTeamId,
        teamId: teamId,
        seasonId: season.id,
        elo: season.initialElo,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    return { seasonTeamId, elo: season.initialElo };
  }
  const seasonTeam = await tx.query.seasonTeams.findFirst({
    columns: { id: true, elo: true },
    where: (st, { and, eq }) => and(eq(st.teamId, teamId as string), eq(st.seasonId, season.id)),
  });
  if (!seasonTeam) {
    const seasonTeamId = createCuid();
    await tx
      .insert(seasonTeams)
      .values({
        id: seasonTeamId,
        seasonId: season.id,
        teamId: teamId,
        elo: season.initialElo,
        createdAt: now,
        updatedAt: now,
      })
      .run();
    return { seasonTeamId, elo: season.initialElo };
  }
  return { seasonTeamId: seasonTeam.id, elo: seasonTeam.elo };
};
