import { CreateSeasonInput } from "@scorebrawl/api";
import { endOfDay, startOfDay } from "date-fns";
import { and, asc, between, desc, eq, gte, inArray, isNull, lte, or, sql } from "drizzle-orm";
import {
  ScoreBrawlError,
  canReadLeaguesCriteria,
  createCuid,
  db,
  getByIdWhereMember,
  leagueEvents,
  leaguePlayers,
  leagues,
  matchPlayers,
  matches,
  seasonPlayers,
  seasonTeams,
  seasons,
  slugifySeasonName,
} from "..";
import { SeasonCreatedEventData } from "../types";

const findOverlappingSeason = async ({
  leagueId,
  startDate,
  endDate,
}: {
  leagueId: string;
  startDate: Date;
  endDate?: Date;
}) =>
  db.query.seasons.findFirst({
    where: and(
      eq(seasons.leagueId, leagueId),
      gte(seasons.endDate, startDate),
      endDate ? lte(seasons.startDate, endDate) : sql`true`,
    ),
  });

export const getSeasonById = async ({
  seasonId,
  userId,
}: {
  seasonId: string;
  userId: string;
}) => {
  const result = await db
    .select()
    .from(seasons)
    .innerJoin(leagues, eq(leagues.id, seasons.leagueId))
    .where(and(eq(seasons.id, seasonId), canReadLeaguesCriteria({ userId })))
    .get();
  if (!result?.season) {
    throw new ScoreBrawlError({
      code: "NOT_FOUND",
      message: "Season not found",
    });
  }
  return result.season;
};

export const findOngoingSeason = async ({
  leagueId,
  userId,
  date,
}: {
  leagueId: string;
  userId: string;
  date?: Date;
}) => {
  const dateParam = date ?? endOfDay(new Date());
  const result = await db
    .select()
    .from(seasons)
    .innerJoin(leagues, eq(leagues.id, seasons.leagueId))
    .where(
      and(
        eq(seasons.leagueId, leagueId),
        lte(seasons.startDate, dateParam),
        or(isNull(seasons.endDate), gte(seasons.endDate, dateParam)),
        canReadLeaguesCriteria({ userId }),
      ),
    )
    .get();
  return result ? { ...result.season } : undefined;
};

export const getSeasonPlayers = async ({
  seasonId,
  userId,
}: {
  seasonId: string;
  userId: string;
}) => {
  // verify access
  await getSeasonById({ seasonId, userId });
  const seasonPlayerResult = await db.query.seasonPlayers.findMany({
    where: eq(seasonPlayers.seasonId, seasonId),
    extras: (_, { sql }) => ({
      matchCount:
        sql<number>`(SELECT COUNT(*) FROM match_player mp WHERE mp.season_player_id = "seasonPlayers"."id")`.as(
          "matchCount",
        ),
      winCount:
        sql<number>`(SELECT COUNT(*) FROM match_player mp WHERE mp.season_player_id = "seasonPlayers"."id" and result = "W")`.as(
          "winCount",
        ),
      lossCount:
        sql<number>`(SELECT COUNT(*) FROM match_player mp WHERE mp.season_player_id = "seasonPlayers"."id" and result = "L")`.as(
          "lossCount",
        ),
      drawCount:
        sql<number>`(SELECT COUNT(*) FROM match_player mp WHERE mp.season_player_id = "seasonPlayers"."id" and result = "D")`.as(
          "drawCount",
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
    orderBy: desc(seasonPlayers.score),
  });

  return seasonPlayerResult.map((sp) => ({
    id: sp.id,
    leaguePlayerId: sp.leaguePlayerId,
    userId: sp.leaguePlayer.userId,
    name: sp.leaguePlayer.user.name,
    imageUrl: sp.leaguePlayer.user.imageUrl,
    score: sp.score,
    joinedAt: sp.createdAt,
    disabled: sp.disabled,
    matchCount: sp.matchCount,
    winCount: sp.winCount,
    lossCount: sp.lossCount,
    drawCount: sp.drawCount,
  }));
};

export const getAllSeasons = async ({
  leagueSlug,
  userId,
}: {
  leagueSlug: string;
  userId: string;
}) => {
  const result = await db
    .select()
    .from(seasons)
    .innerJoin(leagues, eq(leagues.id, seasons.leagueId))
    .where(
      and(
        eq(seasons.leagueId, leagues.id),
        eq(leagues.slug, leagueSlug),
        canReadLeaguesCriteria({ userId }),
      ),
    )
    .orderBy(desc(seasons.startDate))
    .all();

  return result.map((r) => r.season);
};

export const createSeason = async ({
  leagueId,
  userId,
  name,
  startDate,
  endDate,
  initialScore,
  scoreType,
  kFactor,
}: CreateSeasonInput) => {
  if (endDate && startDate.getTime() >= endDate.getTime()) {
    throw new ScoreBrawlError({
      code: "BAD_REQUEST",
      message: "endDate has to be after startDate",
    });
  }
  const league = await getByIdWhereMember({
    leagueId,
    userId,
    allowedRoles: ["owner", "editor"],
  });

  if (!league) {
    throw new ScoreBrawlError({
      code: "FORBIDDEN",
      message: "User does not have editor access to this league",
    });
  }
  const overlappingSeason = await findOverlappingSeason({
    leagueId,
    startDate,
    endDate,
  });
  if (overlappingSeason) {
    throw new ScoreBrawlError({
      code: "CONFLICT",
      message: "Season overlaps with existing season",
    });
  }
  const slug = await slugifySeasonName({ name });
  return db.transaction(async (tx) => {
    const now = new Date();
    const season = await tx
      .insert(seasons)
      .values({
        id: createCuid(),
        name,
        slug,
        leagueId,
        startDate,
        endDate,
        initialElo: initialScore,
        initialScore,
        scoreType,
        kFactor,
        updatedBy: userId,
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
      })
      .returning()
      .get();
    const players = await tx.query.leaguePlayers.findMany({
      columns: { id: true },
      where: and(eq(leaguePlayers.leagueId, leagueId), eq(leaguePlayers.disabled, false)),
    });
    await Promise.all(
      players.map((lp) =>
        tx.insert(seasonPlayers).values({
          id: createCuid(),
          disabled: false,
          elo: season.initialElo,
          score: season.initialScore,
          leaguePlayerId: lp.id,
          seasonId: season.id,
          createdAt: now,
          updatedAt: now,
        }),
      ),
    );

    await tx
      .insert(leagueEvents)
      .values({
        id: createCuid(),
        leagueId: league.id,
        type: "season_created_v1",
        data: { seasonId: season.id } as SeasonCreatedEventData,
        createdBy: userId,
        createdAt: now,
      })
      .run();
  });
};

export const getSeasonStats = async ({
  seasonId,
  userId,
}: {
  seasonId: string;
  userId: string;
}) => {
  const season = await getSeasonById({ userId, seasonId });

  const matchCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(matches)
    .where(eq(matches.seasonId, season.id))
    .get();
  const teamCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(seasonTeams)
    .where(eq(seasonTeams.seasonId, season.id))
    .get();
  const playerCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(seasonPlayers)
    .where(eq(seasonPlayers.seasonId, season.id))
    .get();
  return {
    matchCount: matchCount?.count || 0,
    teamCount: teamCount?.count || 0,
    playerCount: playerCount?.count || 0,
  };
};

export const getSeasonPlayerLatestMatches = async ({
  seasonPlayerIds,
  limit = 5,
}: {
  seasonPlayerIds: string[];
  limit?: number;
}) => {
  return db.query.seasonPlayers.findMany({
    columns: { id: true },
    where: inArray(seasonPlayers.id, seasonPlayerIds),
    with: {
      season: { columns: { id: true } },
      matches: {
        orderBy: (match, { desc }) => [desc(match.createdAt)],
        limit: 5,
      },
    },
  });
};

export const getSeasonTeamsLatestMatches = async ({
  seasonTeamIds,
  limit = 5,
}: {
  seasonTeamIds: string[];
  limit?: number;
}) => {
  return db.query.seasonTeams.findMany({
    columns: { id: true },
    where: inArray(seasonTeams.id, seasonTeamIds),
    with: {
      season: { columns: { id: true } },
      matches: {
        orderBy: (match, { desc }) => [desc(match.createdAt)],
        limit: 5,
      },
    },
  });
};

export const getSeasonTeams = async ({
  seasonId,
  userId,
}: {
  seasonId: string;
  userId: string;
}) => {
  const season = await getSeasonById({ seasonId, userId });
  const teams = await db.query.seasonTeams.findMany({
    extras: (seasonTeam, { sql }) => ({
      matchCount:
        sql<number>`(SELECT COUNT(*) FROM season_team_match stm WHERE stm.season_team_id = "seasonTeams"."id")`.as(
          "matchCount",
        ),
      winCount:
        sql<number>`(SELECT COUNT(*) FROM season_team_match stm WHERE stm.season_team_id = "seasonTeams"."id" and result = "W")`.as(
          "winCount",
        ),
      lossCount:
        sql<number>`(SELECT COUNT(*) FROM season_team_match stm WHERE stm.season_team_id = "seasonTeams"."id" and result = "L")`.as(
          "lossCount",
        ),
      drawCount:
        sql<number>`(SELECT COUNT(*) FROM season_team_match stm WHERE stm.season_team_id = "seasonTeams"."id" and result = "D")`.as(
          "drawCount",
        ),
    }),
    where: eq(seasonTeams.seasonId, season.id),
    columns: { id: true, score: true, createdAt: true, updatedAt: true },
    orderBy: desc(seasonTeams.score),
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
    score: team.score,
    players: team.leagueTeam.players.map((p) => ({
      id: p.leaguePlayer.id,
      name: p.leaguePlayer.user.name,
      imageUrl: p.leaguePlayer.user.imageUrl,
    })),
    matchCount: team.matchCount,
    winCount: team.winCount,
    lossCount: team.lossCount,
    drawCount: team.drawCount,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
  }));
};

export const getSeasonPointProgression = async ({
  seasonId,
  userId,
}: {
  seasonId: string;
  userId: string;
}) => {
  // check if user has permission to view season
  const season = await getSeasonById({ seasonId, userId });
  return db
    .select({
      seasonPlayerId: seasonPlayers.id,
      date: sql`strftime('%Y-%m-%d', datetime(MAX( ${matchPlayers.createdAt}), 'unixepoch'))`.mapWith(
        String,
      ),
      score: matchPlayers.scoreAfter,
    })
    .from(matchPlayers)
    .innerJoin(
      seasonPlayers,
      and(eq(seasonPlayers.id, matchPlayers.seasonPlayerId), eq(seasonPlayers.seasonId, season.id)),
    )
    .groupBy(
      seasonPlayers.id,
      sql`strftime('%Y-%m-%d', datetime(${matchPlayers.createdAt}, 'unixepoch'))`,
    )
    .orderBy(
      seasonPlayers.id,
      sql`strftime('%Y-%m-%d', datetime(${matchPlayers.createdAt}, 'unixepoch'))`,
    );
};

/**
 * used by the public endpoint that is used to show the scores for Jón Þór statue
 */
export const getTodaysDiff = async ({ leagueId, userId }: { leagueId: string; userId: string }) => {
  const now = new Date();
  const dayEnd = endOfDay(now);
  const dayStart = startOfDay(now);
  const season = await db.query.seasons.findFirst({
    where: and(
      eq(seasons.leagueId, leagueId),
      lte(seasons.startDate, dayEnd),
      or(isNull(seasons.endDate), gte(seasons.endDate, dayEnd)),
    ),
    with: {
      seasonPlayers: {
        columns: { id: true, score: true },
        with: {
          leaguePlayer: { columns: { userId: true } },
        },
      },
    },
  });

  if (!season) {
    return { diff: 0 };
  }

  const seasonPlayer = season.seasonPlayers.find((sp) => sp.leaguePlayer.userId === userId);
  if (!seasonPlayer) {
    return { diff: 0 };
  }

  const seasonPlayerMatches = await db.query.matchPlayers.findMany({
    where: and(
      between(matchPlayers.createdAt, dayStart, dayEnd),
      eq(matchPlayers.seasonPlayerId, seasonPlayer.id),
    ),
    orderBy: asc(matchPlayers.createdAt),
  });

  // Ensure there are matches and the array is not empty
  if (seasonPlayerMatches && seasonPlayerMatches.length > 0) {
    // Access scoreBefore of the first match
    const scoreBeforeFirstMatch = seasonPlayerMatches[0]?.scoreBefore;
    // Access scoreAfter of the last match
    const scoreAfterLastMatch = seasonPlayerMatches[seasonPlayerMatches.length - 1]?.scoreAfter;
    // Calculate the difference
    const diff = (scoreAfterLastMatch ?? 0) - (scoreBeforeFirstMatch ?? 0);
    return { diff };
  }
  return { diff: 0 };
};
