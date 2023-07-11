import {
  type LeagueMemberRole,
  leagueMembers,
  leagues,
} from "~/server/db/schema";
import { db } from "~/server/db";
import { and, eq, inArray, isNotNull, or } from "drizzle-orm";
import { type Db } from "~/server/db/types";

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
        inArray(leagueMembers.role, allowedRoles)
      )
    : and(
        eq(leagueMembers.leagueId, leagues.id),
        eq(leagueMembers.userId, userId)
      );
  const result = await db
    .select()
    .from(leagues)
    .innerJoin(leagueMembers, joinCriteria)
    .where(eq(leagues.id, leagueId))
    .get();
  return result?.league;
};

export const canReadLeaguesCriteria = ({
  db,
  userId,
}: {
  db: Db;
  userId: string;
}) =>
  or(
    eq(leagues.visibility, "public"),
    inArray(
      leagues.id,
      db
        .select({ data: leagues.id })
        .from(leagues)
        .innerJoin(leagueMembers, eq(leagueMembers.leagueId, leagues.id))
        .where(and(eq(leagueMembers.userId, userId), isNotNull(leagues.id)))
    )
  );
