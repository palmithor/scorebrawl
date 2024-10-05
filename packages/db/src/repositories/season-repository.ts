import type { ScoreType } from "@scorebrawl/model";
import {
  and,
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
  LeagueEvents,
  LeagueMembers,
  LeaguePlayers,
  Leagues,
  Matches,
  ScoreBrawlError,
  SeasonPlayerRepository,
  SeasonPlayers,
  SeasonTeams,
  Seasons,
  createCuid,
  db,
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
  db.query.Seasons.findFirst({
    where: and(
      eq(Seasons.leagueId, leagueId),
      gte(Seasons.endDate, startDate),
      endDate ? lte(Seasons.startDate, endDate) : sql`true`,
    ),
  });

const getCountInfo = async ({ seasonSlug }: { seasonSlug: string }) => {
  const [matchCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(Matches)
    .innerJoin(Seasons, and(eq(Matches.seasonId, Seasons.id), eq(Seasons.slug, seasonSlug)));

  const [teamCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(SeasonTeams)
    .innerJoin(Seasons, and(eq(SeasonTeams.seasonId, Seasons.id), eq(Seasons.slug, seasonSlug)));

  const [playerCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(SeasonPlayers)
    .innerJoin(Seasons, and(eq(SeasonPlayers.seasonId, Seasons.id), eq(Seasons.slug, seasonSlug)));

  return {
    matchCount: matchCount?.count || 0,
    teamCount: teamCount?.count || 0,
    playerCount: playerCount?.count || 0,
  };
};

const getById = async ({ seasonId }: { seasonId: string }) => {
  const [season] = await db.select().from(Seasons).where(eq(Seasons.id, seasonId));

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
    .from(Seasons)

    .where(eq(Seasons.id, seasonSlug));

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
    .select(getTableColumns(Seasons))
    .from(Seasons)
    .innerJoin(Leagues, eq(Leagues.id, Seasons.leagueId))
    .where(
      and(
        eq(Seasons.leagueId, leagueId),
        lt(Seasons.startDate, now),
        or(isNull(Seasons.endDate), gt(Seasons.endDate, now)),
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
  const seasonPlayerResult = await db.query.SeasonPlayers.findMany({
    where: eq(SeasonPlayers.seasonId, seasonId),
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
    orderBy: desc(SeasonPlayers.score),
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
    .select(getTableColumns(Seasons))
    .from(Seasons)
    .where(eq(Seasons.leagueId, leagueId))
    .orderBy(desc(Seasons.startDate));

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
    .update(Seasons)
    .set({
      updatedAt: new Date(),
      updatedBy: userId,
      ...rest,
    })
    .where(eq(Seasons.id, seasonId))
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
    .insert(Seasons)
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
  const players = await db.query.LeaguePlayers.findMany({
    columns: { id: true },
    where: and(eq(LeaguePlayers.leagueId, leagueId), eq(LeaguePlayers.disabled, false)),
  });
  await Promise.all(
    players.map((lp) =>
      db.insert(SeasonPlayers).values({
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

  await db.insert(LeagueEvents).values({
    leagueId,
    id: createCuid(),
    type: "season_created_v1",
    data: { seasonId: season?.id } as SeasonCreatedEventData,
    createdBy: userId,
    createdAt: now,
  });
  return season as typeof Seasons.$inferSelect;
};
const getSeasonPlayerLatestMatches = async ({
  seasonPlayerIds,
  limit = 5,
}: {
  seasonPlayerIds: string[];
  limit?: number;
}) => {
  return db.query.SeasonPlayers.findMany({
    columns: { id: true },
    where: inArray(SeasonPlayers.id, seasonPlayerIds),
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
  const season = await SeasonRepository.findActive({ leagueId });
  if (!season) {
    return { diff: 0 };
  }
  const seasonPlayers = await SeasonPlayerRepository.getStanding({
    seasonId: season.id,
  });
  const seasonPlayer = seasonPlayers.find((sp) => sp.user.userId === userId);

  return { diff: seasonPlayer?.pointDiff ?? 0 };
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
      leagueId: Leagues.id,
      leagueSlug: Leagues.slug,
      leagueName: Leagues.name,
      role: LeagueMembers.role,
      seasonName: Seasons.name,
      seasonId: Seasons.id,
      seasonSlug: Seasons.slug,
      startDate: Seasons.startDate,
      endDate: Seasons.endDate,
      initialScore: Seasons.initialScore,
    })
    .from(Seasons)
    .innerJoin(Leagues, and(eq(Leagues.slug, leagueSlug), eq(Leagues.id, Seasons.leagueId)))
    .innerJoin(LeagueMembers, eq(LeagueMembers.leagueId, Leagues.id))
    .where(and(eq(Seasons.slug, seasonSlug), eq(LeagueMembers.userId, userId)));
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
