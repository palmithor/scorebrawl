import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { db } from "../db";
import { leagueMembers, leagues } from "../schema";

export const canReadLeaguesCriteria = ({ userId }: { userId: string }) =>
  inArray(
    leagues.id,
    db
      .select({ data: leagues.id })
      .from(leagues)
      .innerJoin(leagueMembers, eq(leagueMembers.leagueId, leagues.id))
      .where(and(eq(leagueMembers.userId, userId), isNotNull(leagues.id))),
  );
