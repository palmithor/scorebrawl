import type { CreateLeagueInput } from "@scorebrawl/api";
import {
  type LeagueMemberRole,
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
import {
  type SQL,
  and,
  asc,
  eq,
  getTableColumns,
  gte,
  inArray,
  isNull,
  like,
  or,
  sql,
} from "drizzle-orm";
import { ScoreBrawlError } from "../errors";
import type { LeagueOmitCode, PlayerJoinedEventData } from "../types";
import { canReadLeaguesCriteria } from "./criteria-util";

const getUserLeagues = async ({
  search,
  userId,
}: {
  search?: string;
  userId: string;
}) => {
  const where = search
    ? and(
        eq(leaguePlayers.userId, userId),
        like(leagues.name, `%${slugifyWithCustomReplacement(search)}%`),
      )
    : eq(leaguePlayers.userId, userId);

  const data = await db
    .select(getTableColumns(leagues))
    .from(leagues)
    .innerJoin(leaguePlayers, eq(leaguePlayers.leagueId, leagues.id))
    .where(where)
    .orderBy(asc(leagues.slug));
  return data.map(({ code, ...league }) => league);
};

const getUserLeaguesPaginated = async ({
  userId,
  search,
  page,
  limit,
}: {
  userId: string;
  search?: string;
  page: number;
  limit: number;
}) => {
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
      archived: leagues.archived,
      createdAt: leagues.createdAt,
      updatedAt: leagues.updatedAt,
      createdBy: leagues.createdBy,
    })
    .from(leagues)
    .innerJoin(leaguePlayers, eq(leaguePlayers.leagueId, leagues.id))
    .where(where)
    .limit(limit)
    .offset((page > 0 ? page - 1 : 0) * limit)
    .orderBy(asc(leagues.slug));
  const [result] = await db
    .select({
      totalCount: sql<number>`cast(count(${leaguePlayers.id}) as int)`,
    })
    .from(leagues)
    .where(where)
    .innerJoin(leaguePlayers, eq(leaguePlayers.leagueId, leagues.id));
  return {
    data: data.map((league) => ({ ...league, code: undefined })),
    meta: { totalCount: result?.totalCount ?? 0, page, limit },
  };
};

const findLeagueBySlug = async ({
  userId,
  leagueSlug: slug,
}: {
  userId: string;
  leagueSlug: string;
}) => {
  const league = await db.query.leagues.findFirst({
    where: (league, { eq }) => and(eq(league.slug, slug), canReadLeaguesCriteria({ userId })),
  });

  return league ? { ...league, code: undefined } : undefined;
};

const getLeagueBySlug = async ({
  userId,
  leagueSlug: slug,
}: {
  userId: string;
  leagueSlug: string;
}) => {
  const league = await findLeagueBySlug({ userId, leagueSlug: slug });

  if (!league) {
    throw new ScoreBrawlError({
      code: "NOT_FOUND",
      message: "League not found",
    });
  }
  return league;
};

const getLeagueById = async ({
  userId,
  leagueId,
}: {
  userId: string;
  leagueId: string;
}) => {
  const [league] = await db
    .select()
    .from(leagues)
    .where(and(eq(leagues.id, leagueId), canReadLeaguesCriteria({ userId })));
  if (!league) {
    throw new ScoreBrawlError({
      code: "NOT_FOUND",
      message: "League not found",
    });
  }
  return { ...league, code: undefined };
};

const hasLeagueEditorAccess = async ({
  userId,
  leagueId,
}: {
  userId: string;
  leagueId: string;
}) => {
  const league = await getByIdWhereMember({
    leagueId: leagueId,
    userId: userId,
    allowedRoles: ["owner", "editor"],
  });
  return !!league;
};

const getLeagueCode = async ({
  league,
  userId,
}: {
  league: LeagueOmitCode;
  userId: string;
}) => {
  const leagueAsMember = await getByIdWhereMember({
    leagueId: league.id,
    userId: userId,
    allowedRoles: ["owner", "editor"],
  });
  if (!leagueAsMember) {
    return undefined;
  }

  const [result] = await db
    .select({ code: leagues.code })
    .from(leagues)
    .where(eq(leagues.id, league.id));
  return result?.code;
};

const getWhereMember = async ({
  allowedRoles,
  userId,
  whereCondition,
}: {
  allowedRoles?: LeagueMemberRole[];
  userId: string;
  whereCondition: SQL<unknown>;
}) => {
  const joinCriteria = allowedRoles
    ? and(
        eq(leagueMembers.leagueId, leagues.id),
        eq(leagueMembers.userId, userId),
        inArray(leagueMembers.role, allowedRoles),
      )
    : and(eq(leagueMembers.leagueId, leagues.id), eq(leagueMembers.userId, userId));
  const [league] = await db
    .select(getTableColumns(leagues))
    .from(leagues)
    .innerJoin(leagueMembers, joinCriteria)
    .where(whereCondition);
  return league;
};

const getBySlugWhereMember = async ({
  userId,
  leagueSlug,
  allowedRoles,
}: {
  userId: string;
  leagueSlug: string;
  allowedRoles?: LeagueMemberRole[];
}) => {
  const whereCondition = eq(leagues.slug, leagueSlug);
  return await getWhereMember({ allowedRoles, userId, whereCondition });
};

const getByIdWhereMember = async ({
  userId,
  leagueId,
  allowedRoles,
}: {
  userId: string;
  leagueId: string;
  allowedRoles?: LeagueMemberRole[];
}) => {
  const whereCondition = eq(leagues.id, leagueId);
  return await getWhereMember({ allowedRoles, userId, whereCondition });
};

const getLeagueBySlugWithMembership = async ({
  userId,
  leagueSlug,
}: { userId: string; leagueSlug: string }) => {
  const [league] = await db
    .select({ leagueId: leagues.id, leagueSlug: leagues.slug, role: leagueMembers.role })
    .from(leagues)
    .innerJoin(leagueMembers, eq(leagueMembers.leagueId, leagues.id))
    .where(and(eq(leagues.slug, leagueSlug), eq(leagueMembers.userId, userId)));
  return league;
};

const createLeague = async ({ name, logoUrl, userId }: CreateLeagueInput) => {
  const slug = await slugifyLeagueName({ name });
  const now = new Date();
  const [league] = await db
    .insert(leagues)
    .values({
      id: createCuid(),
      slug,
      name,
      logoUrl,
      code: createCuid(),
      updatedBy: userId,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    })
    .returning(getTableColumns(leagues));
  await db.insert(leagueMembers).values({
    id: createCuid(),
    leagueId: league?.id ?? "",
    userId: userId,
    role: "owner",
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(leaguePlayers).values({
    id: createCuid(),
    leagueId: league?.id ?? "",
    userId: userId,
    createdAt: now,
    updatedAt: now,
  });
  return league;
};

const joinLeague = async ({
  code,
  userId,
}: {
  code: string;
  userId: string;
}) => {
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
  await db
    .insert(leagueMembers)
    .values({
      id: createCuid(),
      userId: userId,
      leagueId: league.id,
      role: "member",
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing();

  const [leaguePlayer] = await db
    .insert(leaguePlayers)
    .values({
      id: createCuid(),
      userId: userId,
      leagueId: league.id,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing()
    .returning();

  if (leaguePlayer) {
    const ongoingAndFutureSeasons = await db.query.seasons.findMany({
      where: and(
        eq(seasons.leagueId, league.id),
        or(isNull(seasons.endDate), gte(seasons.endDate, now)),
      ),
    });

    for (const season of ongoingAndFutureSeasons) {
      await db
        .insert(seasonPlayers)
        .values({
          id: createCuid(),
          leaguePlayerId: leaguePlayer?.id ?? "",
          elo: season.initialScore,
          score: season.initialScore,
          seasonId: season.id,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoNothing();
    }
    await db
      .insert(leagueEvents)
      .values({
        id: createCuid(),
        leagueId: league.id,
        type: "player_joined_v1",
        data: {
          leaguePlayerId: leaguePlayer?.id ?? "",
        } as PlayerJoinedEventData,
        createdBy: userId,
        createdAt: now,
      })
      .onConflictDoNothing();
  }

  return league;
};

const getLeagueStats = async ({
  leagueId,
  userId,
}: {
  leagueId: string;
  userId: string;
}) => {
  // verify access
  await getLeagueById({ userId, leagueId });

  const [matchCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(matches)
    .where(
      inArray(
        matches.seasonId,
        db.select({ id: seasons.id }).from(seasons).where(eq(seasons.leagueId, leagueId)),
      ),
    );

  const [teamCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(leagueTeams)
    .where(eq(leagueTeams.leagueId, leagueId));
  const [seasonCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(seasons)
    .where(eq(seasons.leagueId, leagueId));

  const [playerCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(leaguePlayers)
    .where(eq(leaguePlayers.leagueId, leagueId));

  return {
    seasonCount: seasonCount?.count || 0,
    matchCount: matchCount?.count || 0,
    teamCount: teamCount?.count || 0,
    playerCount: playerCount?.count || 0,
  };
};

export const LeagueRepository = {
  createLeague,
  findLeagueBySlug,
  getByIdWhereMember,
  getBySlugWhereMember,
  getLeagueBySlugWithMembership,
  getLeagueById,
  getLeagueBySlug,
  getLeagueCode,
  getLeagueStats,
  getUserLeagues,
  getUserLeaguesPaginated,
  hasLeagueEditorAccess,
  joinLeague,
};
