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

export const canEditLeagueCriteria = ({ userId, leagueId }: { userId: string; leagueId: string }) =>
  inArray(
    leagues.id,
    db
      .select({ data: leagues.id })
      .from(leagues)
      .innerJoin(
        leagueMembers,
        and(
          eq(leagueMembers.leagueId, leagues.id),
          inArray(leagueMembers.role, ["owner", "editor"]),
        ),
      )
      .where(
        and(eq(leagueMembers.userId, userId), isNotNull(leagues.id), eq(leagues.id, leagueId)),
      ),
  );
