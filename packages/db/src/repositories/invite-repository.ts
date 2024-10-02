import { and, desc, eq, getTableColumns, gte, isNull, or } from "drizzle-orm";
import { db } from "../db";
import {
  leagueInvites,
  leagueMembers,
  leaguePlayers,
  leagues,
  seasonPlayers,
  seasons,
} from "../schema";
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

const findByCode = async (code: string) => {
  const [invite] = await db
    .select(getTableColumns(leagueInvites))
    .from(leagueInvites)
    .where(eq(leagueInvites.code, code));
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

const claimInvite = async ({
  userId,
  leagueId,
  role,
}: { leagueId: string; userId: string; role: LeagueMemberRole }) => {
  await db
    .delete(leagueMembers)
    .where(and(eq(leagueMembers.leagueId, leagueId), eq(leagueMembers.userId, userId)));
  const now = new Date();
  await db
    .insert(leagueMembers)
    .values({ id: createCuid(), leagueId, userId, role, createdAt: now, updatedAt: now });
  if (role !== "viewer") {
    const [leaguePlayer] = await db
      .insert(leaguePlayers)
      .values({ id: createCuid(), leagueId, userId, createdAt: now, updatedAt: now })
      .returning();
    const futureOrOngoingSeasons = await db
      .select({ id: seasons.id, initialScore: seasons.initialScore })
      .from(seasons)
      .where(
        and(eq(seasons.leagueId, leagueId), or(gte(seasons.endDate, now), isNull(seasons.endDate))),
      );
    await db.insert(seasonPlayers).values(
      futureOrOngoingSeasons.map(
        ({ id, initialScore }) =>
          ({
            id: createCuid(),
            seasonId: id,
            leaguePlayerId: leaguePlayer?.id ?? "",
            score: initialScore,
            createdAt: now,
            updatedAt: now,
          }) satisfies typeof seasonPlayers.$inferInsert,
      ),
    );
  }
  const [league] = await db
    .select({ slug: leagues.slug })
    .from(leagues)
    .where(eq(leagues.id, leagueId));
  return { leagueSlug: league?.slug ?? "" };
};

export const InviteRepository = {
  createInvite,
  findByCode,
  getLeagueInvites,
  claimInvite,
};
