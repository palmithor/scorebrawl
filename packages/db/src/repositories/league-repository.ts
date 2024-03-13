import { CreateLeagueInput } from "@scorebrawl/api";
import {
  LeagueMemberRole,
  createCuid,
  db,
  leagueEvents,
  leagueMembers,
  leaguePlayers,
  leagueTeams,
  leagues,
  matches,
  seasonPlayers,
  seasons,
  slugifyLeagueName,
  slugifyWithCustomReplacement,
} from "@scorebrawl/db";
import { and, asc, eq, gte, inArray, isNotNull, isNull, like, or, sql } from "drizzle-orm";
import { ScoreBrawlError } from "../errors";
import { LeagueOmitCode, PlayerJoinedEventData } from "../types";

export const canReadLeaguesCriteria = ({ userId }: { userId: string }) =>
  or(
    eq(leagues.visibility, "public"),
    inArray(
      leagues.id,
      db
        .select({ data: leagues.id })
        .from(leagues)
        .innerJoin(leagueMembers, eq(leagueMembers.leagueId, leagues.id))
        .where(and(eq(leagueMembers.userId, userId), isNotNull(leagues.id))),
    ),
  );

export const getUserLeagues = async ({
  userId,
  search,
  page,
  limit,
}: { userId: string; search?: string; page: number; limit: number }) => {
  const where = search
    ? and(
        eq(leaguePlayers.userId, userId),
        like(leagues.name, `%${slugifyWithCustomReplacement(search)}%`),
      )
    : eq(leaguePlayers.userId, userId);

  const data = await db
    .select({
      id: leagues.id,
      name: leagues.name,
      logoUrl: leagues.logoUrl,
      slug: leagues.slug,
      visibility: leagues.visibility,
      archived: leagues.archived,
      createdAt: leagues.createdAt,
      updatedAt: leagues.updatedAt,
      createdBy: leagues.createdBy,
    })
    .from(leagues)
    .innerJoin(leaguePlayers, eq(leaguePlayers.leagueId, leagues.id))
    .where(where)
    .limit(limit)
    .offset((page - 1) * limit)
    .orderBy(asc(leagues.slug));

  const { count } = (await db
    .select({ count: sql<number>`cast(count(${leaguePlayers.id}) as int)` })
    .from(leagues)
    .where(where)
    .innerJoin(leaguePlayers, eq(leaguePlayers.leagueId, leagues.id))
    .get()) as { count: number };
  return {
    data: data.map((league) => ({ ...league, code: undefined })),
    meta: { totalCount: count, page, limit },
  };
};

export const getAllLeagues = async ({
  userId,
  search,
  page,
  limit,
}: { userId: string; search: string; page: number; limit: number }) => {
  const data = await db.query.leagues.findMany({
    columns: { code: false },
    where: and(canReadLeaguesCriteria({ userId }), like(leagues.name, `%${search}%`)),
    offset: (page - 1) * limit,
    limit,
    orderBy: asc(leagues.slug),
  });

  const { count } = (await db
    .select({ count: sql<number>`cast(count(${leagues.id}) as int)` })
    .from(leagues)
    .where(and(canReadLeaguesCriteria({ userId }), like(leagues.name, `%${search}%`)))
    .get()) as { count: number };

  return {
    data: data.map((league) => ({ ...league, code: undefined })),
    meta: { totalCount: count, page, limit },
  };
};

export const getLeagueBySlug = async ({
  userId,
  leagueSlug: slug,
}: { userId: string; leagueSlug: string }) => {
  const league = await db.query.leagues.findFirst({
    where: (league, { eq }) => and(eq(league.slug, slug), canReadLeaguesCriteria({ userId })),
  });

  if (!league) {
    throw new ScoreBrawlError({
      code: "NOT_FOUND",
      message: "League not found",
    });
  }
  return { ...league, code: undefined };
};

export const getLeagueById = async ({ userId, leagueId }: { userId: string; leagueId: string }) => {
  const league = await db
    .select()
    .from(leagues)
    .where(and(eq(leagues.id, leagueId), canReadLeaguesCriteria({ userId })))
    .get();
  if (!league) {
    throw new ScoreBrawlError({
      code: "NOT_FOUND",
      message: "League not found",
    });
  }
  return { ...league, code: undefined };
};

export const getHasLeagueEditorAccess = async ({
  userId,
  leagueId,
}: { userId: string; leagueId: string }) => {
  const league = await getByIdWhereMember({
    leagueId: leagueId,
    userId: userId,
    allowedRoles: ["owner", "editor"],
  });

  return !!league;
};

export const getLeagueCode = async ({
  league,
  userId,
}: { league: LeagueOmitCode; userId: string }) => {
  if (league.visibility === "private") {
    const leagueAsMember = await getByIdWhereMember({
      leagueId: league.id,
      userId: userId,
      allowedRoles: ["owner", "editor"],
    });
    if (!leagueAsMember) {
      return undefined;
    }
  }
  return (
    await db.select({ code: leagues.code }).from(leagues).where(eq(leagues.id, league.id)).get()
  )?.code;
};

export const getByIdWhereMember = async ({
  userId,
  leagueId,
  allowedRoles,
}: {
  userId: string;
  leagueId: string;
  allowedRoles?: LeagueMemberRole[];
}) => {
  const joinCriteria = allowedRoles
    ? and(
        eq(leagueMembers.leagueId, leagues.id),
        eq(leagueMembers.userId, userId),
        inArray(leagueMembers.role, allowedRoles),
      )
    : and(eq(leagueMembers.leagueId, leagues.id), eq(leagueMembers.userId, userId));
  const result = await db
    .select()
    .from(leagues)
    .innerJoin(leagueMembers, joinCriteria)
    .where(eq(leagues.id, leagueId))
    .get();
  return result?.league;
};

export const createLeague = async ({ name, logoUrl, userId, visibility }: CreateLeagueInput) => {
  const slug = await slugifyLeagueName({ name });
  const now = new Date();
  return db.transaction(async (tx) => {
    const league = await tx
      .insert(leagues)
      .values({
        id: createCuid(),
        slug,
        name,
        logoUrl,
        visibility,
        code: createCuid(),
        updatedBy: userId,
        createdBy: userId,
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
        userId: userId,
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
        userId: userId,
        createdAt: now,
        updatedAt: now,
      })
      .run();
    return league;
  });
};

export const joinLeague = async ({ code, userId }: { code: string; userId: string }) => {
  const league = await db.query.leagues.findFirst({
    where: eq(leagues.code, code),
  });

  if (!league) {
    throw new ScoreBrawlError({
      code: "NOT_FOUND",
      message: "League not found",
    });
  }

  const now = new Date();
  await db.transaction(async (tx): Promise<void> => {
    await tx
      .insert(leagueMembers)
      .values({
        id: createCuid(),
        userId: userId,
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
        userId: userId,
        leagueId: league.id,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing()
      .returning()
      .get();

    if (leaguePlayer) {
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
            elo: season.initialScore,
            score: season.initialScore,
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
          createdBy: userId,
          createdAt: now,
        })
        .onConflictDoNothing()
        .run();
    }
  });

  return league;
};

export const getLeagueStats = async ({
  leagueId,
  userId,
}: { leagueId: string; userId: string }) => {
  // verify access
  await getLeagueById({ userId, leagueId });

  const matchCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(matches)
    .where(
      inArray(
        matches.seasonId,
        db.select({ id: seasons.id }).from(seasons).where(eq(seasons.leagueId, leagueId)),
      ),
    )
    .get();

  const teamCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(leagueTeams)
    .where(eq(leagueTeams.leagueId, leagueId))
    .get();
  const seasonCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(seasons)
    .where(eq(seasons.leagueId, leagueId))
    .get();
  const playerCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(leaguePlayers)
    .where(eq(leaguePlayers.leagueId, leagueId))
    .get();
  return {
    seasonCount: seasonCount?.count || 0,
    matchCount: matchCount?.count || 0,
    teamCount: teamCount?.count || 0,
    playerCount: playerCount?.count || 0,
  };
};
