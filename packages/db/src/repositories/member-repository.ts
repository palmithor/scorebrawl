import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { leagueMembers, leagues, users } from "../schema";

export const MemberRepository = {
  find: async ({ leagueId }: { leagueId: string }) => {
    return db
      .select({
        memberId: leagueMembers.id,
        role: leagueMembers.role,
        userId: leagueMembers.userId,
        name: users.name,
        imageUrl: users.imageUrl,
      })
      .from(leagueMembers)
      .innerJoin(users, eq(users.id, leagueMembers.userId))
      .innerJoin(leagues, eq(leagues.id, leagueMembers.leagueId))
      .where(and(eq(leagues.id, leagueId)));
  },
};
