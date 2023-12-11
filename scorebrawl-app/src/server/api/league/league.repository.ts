import { TRPCError } from "@trpc/server";
import { and, eq, inArray, isNotNull, or } from "drizzle-orm";
import { db } from "~/server/db";
import { type LeagueMemberRole, leagueMembers, leagues } from "~/server/db/schema";

export const findLeagueIdBySlug = async ({ userId, slug }: { userId: string; slug: string }) => {
  const row = await db
    .select({ leagueId: leagues.id })
    .from(leagues)
    .where(and(eq(leagues.slug, slug), canReadLeaguesCriteria({ userId })))
    .get();
  return row?.leagueId;
};

export const getLeagueIdBySlug = async (input: {
  userId: string;
  slug: string;
}) => {
  const leagueId = await findLeagueIdBySlug(input);
  if (!leagueId) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "League not found",
    });
  }
  return leagueId;
};

export const getLeagueBySlug = async ({ userId, slug }: { userId: string; slug: string }) => {
  const league = await db.query.leagues.findFirst({
    where: (league, { eq }) => and(eq(league.slug, slug), canReadLeaguesCriteria({ userId })),
  });

  if (!league) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "League not found",
    });
  }
  return league;
};

export const getLeagueById = async ({ userId, id }: { userId: string; id: string }) => {
  const league = await db
    .select()
    .from(leagues)
    .where(and(eq(leagues.id, id), canReadLeaguesCriteria({ userId })))
    .get();
  if (!league) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "League not found",
    });
  }
  return league;
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
