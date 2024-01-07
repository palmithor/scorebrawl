import { CreateLeagueInput } from "@scorebrawl/api";
import {
  createCuid,
  db,
  leagueMembers,
  leaguePlayers,
  leagues,
  slugifyLeagueName,
} from "@scorebrawl/db";
import { and, eq, inArray, isNotNull, or } from "drizzle-orm";
import z from "zod";
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
