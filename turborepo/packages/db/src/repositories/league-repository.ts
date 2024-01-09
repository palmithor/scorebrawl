import { CreateLeagueInput } from "@scorebrawl/api";
import {
  createCuid,
  db,
  leagueMembers,
  leaguePlayers,
  leagues,
  slugifyLeagueName,
  slugifyWithCustomReplacement,
} from "@scorebrawl/db";
import { and, asc, eq, inArray, isNotNull, like, or, sql } from "drizzle-orm";
import { ScoreBrawlError } from "../errors";

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
    data: data,
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

  return { data, meta: { totalCount: count, page, limit } };
};

export const getLeagueBySlug = async ({ userId, slug }: { userId: string; slug: string }) => {
  const league = await db.query.leagues.findFirst({
    where: (league, { eq }) => and(eq(league.slug, slug), canReadLeaguesCriteria({ userId })),
  });

  if (!league) {
    throw new ScoreBrawlError({
      code: "NOT_FOUND",
      message: "League not found",
    });
  }
  return league;
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
