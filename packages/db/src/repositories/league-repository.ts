import {
  createCuid,
  db,
  leagueEvents,
  leagueMembers,
  leaguePlayers,
  leagues,
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
  ilike,
  inArray,
  isNull,
  or,
} from "drizzle-orm";
import type { LeagueInput } from "../../../model/src/league";
import { ScoreBrawlError } from "../errors";
import type { LeagueMemberRole, PlayerJoinedEventData } from "../types";
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
        ilike(leagues.name, `%${slugifyWithCustomReplacement(search)}%`),
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
const findBySlug = async ({
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
  leagueId,
  userId,
}: {
  leagueId: string;
  userId: string;
}) => {
  const leagueAsMember = await getByIdWhereMember({
    leagueId: leagueId,
    userId: userId,
    allowedRoles: ["owner", "editor"],
  });
  if (!leagueAsMember) {
    return undefined;
  }

  const [result] = await db
    .select({ code: leagues.code })
    .from(leagues)
    .where(eq(leagues.id, leagueId));
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

const findBySlugWithUserRole = async ({
  userId,
  leagueSlug,
}: {
  userId: string;
  leagueSlug: string;
}) => {
  const [league] = await db
    .select({
      id: leagues.id,
      slug: leagues.slug,
      name: leagues.name,
      role: leagueMembers.role,
    })
    .from(leagues)
    .innerJoin(leagueMembers, eq(leagueMembers.leagueId, leagues.id))
    .where(and(eq(leagues.slug, leagueSlug), eq(leagueMembers.userId, userId)));
  return league;
};

const createLeague = async ({ name, logoUrl, userId }: LeagueInput) => {
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
    .returning();
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

export const LeagueRepository = {
  createLeague,
  findBySlug,
  getByIdWhereMember,
  findBySlugWithUserRole,
  getLeagueById,
  getLeagueCode,
  getUserLeagues,
  hasLeagueEditorAccess,
  joinLeague,
};
