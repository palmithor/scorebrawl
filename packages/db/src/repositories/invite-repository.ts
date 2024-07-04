import { and, eq, getTableColumns } from "drizzle-orm";
import { db } from "../db";
import { ScoreBrawlError } from "../errors";
import { type LeagueMemberRole, leagueInvites, leagues } from "../schema";
import { createCuid } from "../utils";
import { canReadLeaguesCriteria } from "./criteria-util";
import { LeagueRepository } from "./league-repository";

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
  const hasEditorAccess = await LeagueRepository.hasLeagueEditorAccess({ userId, leagueId });
  if (!hasEditorAccess) {
    throw new ScoreBrawlError({
      code: "FORBIDDEN",
      message: "league access denied",
    });
  }
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
    .returning(getTableColumns(leagueInvites));
  return invite;
};

const getLeagueInvites = async ({
  userId,
  leagueId,
}: {
  userId: string;
  leagueId: string;
}) =>
  db
    .select(getTableColumns(leagueInvites))
    .from(leagueInvites)
    .innerJoin(leagues, eq(leagueInvites.leagueId, leagues.id))
    .where(and(eq(leagueInvites.leagueId, leagueId), canReadLeaguesCriteria({ userId })));

export const InviteRepository = {
  createInvite,
  getLeagueInvites,
};
