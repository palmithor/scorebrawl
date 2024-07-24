import { desc, eq, getTableColumns } from "drizzle-orm";
import { db } from "../db";
import { leagueInvites, leagues } from "../schema";
import type { LeagueMemberRole } from "../types";
import { createCuid } from "../utils";

const createInvite = async ({
  userId,
  leagueId,
  role,
  expiresAt,
}: {
  userId: string;
  leagueId: string;
  role: LeagueMemberRole;
  expiresAt?: Date;
}) => {
  const now = new Date();
  const [invite] = await db
    .insert(leagueInvites)
    .values([
      {
        leagueId,
        id: createCuid(),
        code: createCuid(),
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
        updatedBy: userId,
        role,
        expiresAt,
      },
    ])
    .returning();
  return invite;
};

const getLeagueInvites = async ({
  leagueId,
}: {
  leagueId: string;
}) =>
  db
    .select(getTableColumns(leagueInvites))
    .from(leagueInvites)
    .innerJoin(leagues, eq(leagueInvites.leagueId, leagues.id))
    .where(eq(leagueInvites.leagueId, leagueId))
    .orderBy(desc(leagueInvites.expiresAt));

export const InviteRepository = {
  createInvite,
  getLeagueInvites,
};
