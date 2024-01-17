import { CreateSeasonInput } from "@scorebrawl/api";
import { and, desc, eq, gte, isNull, lte, or, sql } from "drizzle-orm";
import {
  ScoreBrawlError,
  canReadLeaguesCriteria,
  createCuid,
  db,
  getByIdWhereMember,
  leagueEvents,
  leaguePlayers,
  leagues,
  seasonPlayers,
  seasons,
  slugifySeasonName,
} from "..";
import { SeasonCreatedEventData } from "../types";

const findOverlappingSeason = async ({
  leagueId,
  startDate,
  endDate,
}: { leagueId: string; startDate: Date; endDate?: Date }) =>
  db.query.seasons.findFirst({
    where: and(
      eq(seasons.leagueId, leagueId),
      gte(seasons.endDate, startDate),
      endDate ? lte(seasons.startDate, endDate) : sql`true`,
    ),
  });

export const getSeasonById = async ({ seasonId, userId }: { seasonId: string; userId: string }) => {
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
}: { leagueId: string; userId: string; date?: Date }) => {
  const dateParam = date ?? new Date();
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
}: { seasonId: string; userId: string }) => {
  // verify access
  await getSeasonById({ seasonId, userId });
  const seasonPlayerResult = await db.query.seasonPlayers.findMany({
    where: eq(seasonPlayers.seasonId, seasonId),
    extras: (_, { sql }) => ({
      matchCount:
        sql<number>`(SELECT COUNT(*) FROM match_player mp WHERE mp.season_player_id = "seasonPlayers"."id")`.as(
          "matchCount",
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
    orderBy: desc(seasonPlayers.elo),
  });

  return seasonPlayerResult.map((sp) => ({
    id: sp.id,
    userId: sp.leaguePlayer.userId,
    name: sp.leaguePlayer.user.name,
    imageUrl: sp.leaguePlayer.user.imageUrl,
    elo: sp.elo,
    joinedAt: sp.createdAt,
    disabled: sp.disabled,
    matchCount: sp.matchCount,
  }));
};

export const getAllSeasons = async ({
  leagueSlug,
  userId,
}: { leagueSlug: string; userId: string }) => {
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
  initialElo,
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
  const overlappingSeason = await findOverlappingSeason({ leagueId, startDate, endDate });
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
        initialElo,
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
