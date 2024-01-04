import { db, leagueMembers, leagues } from "@scorebrawl/db";
import { and, eq, inArray, isNotNull, or } from "drizzle-orm";
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
