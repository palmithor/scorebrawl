import type { ScoreType } from "@scorebrawl/model";
import { endOfDay, startOfDay } from "date-fns";
import {
  and,
  asc,
  between,
  desc,
  eq,
  getTableColumns,
  gt,
  gte,
  inArray,
  isNull,
  lt,
  lte,
  or,
  sql,
} from "drizzle-orm";
import {
  ScoreBrawlError,
  createCuid,
  db,
  leagueEvents,
  leagueMembers,
  leaguePlayers,
  leagues,
  matchPlayers,
  matches,
  seasonPlayers,
  seasonTeams,
  seasons,
  slugifySeasonName,
} from "..";
import type { SeasonCreate } from "../../../model/src/season";
import type { SeasonCreatedEventData } from "../types";

export const findOverlappingSeason = async ({
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

const getCountInfo = async ({ seasonSlug }: { seasonSlug: string }) => {
  const [matchCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(matches)
    .innerJoin(seasons, and(eq(matches.seasonId, seasons.id), eq(seasons.slug, seasonSlug)));

  const [teamCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(seasonTeams)
    .innerJoin(seasons, and(eq(seasonTeams.seasonId, seasons.id), eq(seasons.slug, seasonSlug)));

  const [playerCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(seasonPlayers)
    .innerJoin(seasons, and(eq(seasonPlayers.seasonId, seasons.id), eq(seasons.slug, seasonSlug)));

  return {
    matchCount: matchCount?.count || 0,
    teamCount: teamCount?.count || 0,
    playerCount: playerCount?.count || 0,
  };
};

const getById = async ({ seasonId }: { seasonId: string }) => {
  const [season] = await db.select().from(seasons).where(eq(seasons.id, seasonId));

  if (!season) {
    throw new ScoreBrawlError({
      code: "NOT_FOUND",
      message: "Season not found",
    });
  }
  return season;
};

const getBySlug = async ({ seasonSlug }: { seasonSlug: string }) => {
  const [season] = await db
    .select()
    .from(seasons)

    .where(eq(seasons.id, seasonSlug));

  if (!season) {
    throw new ScoreBrawlError({
      code: "NOT_FOUND",
      message: "Season not found",
    });
  }
  return season;
};

const findActive = async ({ leagueId }: { leagueId: string }) => {
  const now = new Date();
  const [season] = await db
    .select(getTableColumns(seasons))
    .from(seasons)
    .innerJoin(leagues, eq(leagues.id, seasons.leagueId))
    .where(
      and(
        eq(seasons.leagueId, leagueId),
        lt(seasons.startDate, now),
        or(isNull(seasons.endDate), gt(seasons.endDate, now)),
      ),
    );
  return season;
};

const getSeasonPlayers = async ({
  seasonId,
}: {
  leagueId: string;
  seasonId: string;
  userId: string;
}) => {
  const seasonPlayerResult = await db.query.seasonPlayers.findMany({
    where: eq(seasonPlayers.seasonId, seasonId),
    extras: (_, { sql }) => ({
      matchCount:
        sql<number>`(SELECT COUNT(*) FROM match_player mp WHERE mp.season_player_id = "seasonPlayers"."id")`.as(
          "matchCount",
        ),
      winCount:
        sql<number>`(SELECT COUNT(*) FROM match_player mp WHERE mp.season_player_id = "seasonPlayers"."id" and result = 'W')`.as(
          "winCount",
        ),
      lossCount:
        sql<number>`(SELECT COUNT(*) FROM match_player mp WHERE mp.season_player_id = "seasonPlayers"."id" and result = 'L')`.as(
          "lossCount",
        ),
      drawCount:
        sql<number>`(SELECT COUNT(*) FROM match_player mp WHERE mp.season_player_id = "seasonPlayers"."id" and result = 'D')`.as(
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
    matchCount: Number(sp.matchCount),
    winCount: Number(sp.winCount),
    lossCount: Number(sp.lossCount),
    drawCount: Number(sp.drawCount),
  }));
};

const getAll = async ({ leagueId }: { leagueId: string }) =>
  db
    .select(getTableColumns(seasons))
    .from(seasons)
    .where(eq(seasons.leagueId, leagueId))
    .orderBy(desc(seasons.startDate));

const update = async ({
  userId,
  seasonId,
  ...rest
}: {
  userId: string;
  seasonId: string;
  startDate?: Date;
  endDate?: Date;
  initialScore?: number;
  scoreType?: ScoreType;
  kFactor?: number;
}) => {
  const [season] = await db
    .update(seasons)
    .set({
      updatedAt: new Date(),
      updatedBy: userId,
      ...rest,
    })
    .where(eq(seasons.id, seasonId))
    .returning();
  return season;
};

const create = async ({
  leagueId,
  userId,
  name,
  startDate,
  endDate,
  initialScore,
  scoreType,
  kFactor,
}: SeasonCreate) => {
  const slug = await slugifySeasonName({ name });

  const now = new Date();
  const [season] = await db
    .insert(seasons)
    .values({
      id: createCuid(),
      name,
      slug,
      leagueId,
      startDate,
      endDate,
      initialScore,
      scoreType,
      kFactor,
      updatedBy: userId,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  const players = await db.query.leaguePlayers.findMany({
    columns: { id: true },
    where: and(eq(leaguePlayers.leagueId, leagueId), eq(leaguePlayers.disabled, false)),
  });
  await Promise.all(
    players.map((lp) =>
      db.insert(seasonPlayers).values({
        id: createCuid(),
        disabled: false,
        score: season?.initialScore ?? 0,
        leaguePlayerId: lp.id,
        seasonId: season?.id ?? "",
        createdAt: now,
        updatedAt: now,
      }),
    ),
  );

  await db.insert(leagueEvents).values({
    leagueId,
    id: createCuid(),
    type: "season_created_v1",
    data: { seasonId: season?.id } as SeasonCreatedEventData,
    createdBy: userId,
    createdAt: now,
  });
  return season as typeof seasons.$inferSelect;
};
const getSeasonPlayerLatestMatches = async ({
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
        limit,
      },
    },
  });
};

/**
 * used by the public endpoint that is used to show the scores for Jón Þór statue
 */
const getTodayDiff = async ({
  leagueId,
  userId,
}: {
  leagueId: string;
  userId: string;
}) => {
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

export const findSeasonAndLeagueBySlug = async ({
  leagueSlug,
  seasonSlug,
  userId,
}: {
  leagueSlug: string;
  seasonSlug: string;
  userId: string;
}) => {
  const [league] = await db
    .select({
      leagueId: leagues.id,
      leagueSlug: leagues.slug,
      leagueName: leagues.name,
      role: leagueMembers.role,
      seasonName: seasons.name,
      seasonId: seasons.id,
      seasonSlug: seasons.slug,
      startDate: seasons.startDate,
      endDate: seasons.endDate,
      initialScore: seasons.initialScore,
    })
    .from(seasons)
    .innerJoin(leagues, and(eq(leagues.slug, leagueSlug), eq(leagues.id, seasons.leagueId)))
    .innerJoin(leagueMembers, eq(leagueMembers.leagueId, leagues.id))
    .where(and(eq(seasons.slug, seasonSlug), eq(leagueMembers.userId, userId)));
  return league;
};

export const SeasonRepository = {
  create,
  getCountInfo,
  findActive,
  findOverlappingSeason,
  getAll,
  getBySlug,
  getById,
  getSeasonPlayerLatestMatches,
  getSeasonPlayers,
  getTodayDiff,
  update,
  findSeasonAndLeagueBySlug,
};
