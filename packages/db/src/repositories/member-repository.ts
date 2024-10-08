import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { LeagueMembers, Leagues, Users } from "../schema";

export const findAll = async ({ leagueId }: { leagueId: string }) =>
  db
    .select({
      memberId: LeagueMembers.id,
      role: LeagueMembers.role,
      userId: LeagueMembers.userId,
      name: Users.name,
      imageUrl: Users.imageUrl,
    })
    .from(LeagueMembers)
    .innerJoin(Users, eq(Users.id, LeagueMembers.userId))
    .innerJoin(Leagues, eq(Leagues.id, LeagueMembers.leagueId))
    .where(and(eq(Leagues.id, leagueId)));
