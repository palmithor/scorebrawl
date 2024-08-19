import {
  createCuid,
  db,
  leagueMembers,
  leaguePlayers,
  leagues,
  slugifyLeagueName,
  slugifyWithCustomReplacement,
} from "@scorebrawl/db";
import { type SQL, and, asc, eq, getTableColumns, ilike, inArray } from "drizzle-orm";
import type { z } from "zod";
import type { LeagueCreate, LeagueEdit } from "../../../model";
import { ScoreBrawlError } from "../errors";
import type { LeagueMemberRole } from "../types";
import { canReadLeaguesCriteria } from "./criteria-util";

const getUserLeagues = async ({
  search,
  userId,
}: {
  search?: string;
  userId: string;
}) => {
  const where = search
    ? and(
        eq(leagueMembers.userId, userId),
        ilike(leagues.name, `%${slugifyWithCustomReplacement(search)}%`),
      )
    : eq(leagueMembers.userId, userId);

  return db
    .select(getTableColumns(leagues))
    .from(leagues)
    .innerJoin(leagueMembers, eq(leagueMembers.leagueId, leagues.id))
    .where(where)
    .orderBy(asc(leagues.slug));
};
const findBySlug = async ({
  userId,
  leagueSlug: slug,
}: {
  userId: string;
  leagueSlug: string;
}) => {
  const league = await db.query.leagues.findFirst({
    where: (league, { eq }) => and(eq(league.slug, slug), canReadLeaguesCriteria({ userId })),
  });

  return league ? { ...league, code: undefined } : undefined;
};

const getLeagueById = async ({
  userId,
  leagueId,
}: {
  userId: string;
  leagueId: string;
}) => {
  const [league] = await db
    .select()
    .from(leagues)
    .where(and(eq(leagues.id, leagueId), canReadLeaguesCriteria({ userId })));
  if (!league) {
    throw new ScoreBrawlError({
      code: "NOT_FOUND",
      message: "League not found",
    });
  }
  return { ...league, code: undefined };
};

const hasLeagueEditorAccess = async ({
  userId,
  leagueId,
}: {
  userId: string;
  leagueId: string;
}) => {
  const league = await getByIdWhereMember({
    leagueId: leagueId,
    userId: userId,
    allowedRoles: ["owner", "editor"],
  });
  return !!league;
};

const getWhereMember = async ({
  allowedRoles,
  userId,
  whereCondition,
}: {
  allowedRoles?: LeagueMemberRole[];
  userId: string;
  whereCondition: SQL<unknown>;
}) => {
  const joinCriteria = allowedRoles
    ? and(
        eq(leagueMembers.leagueId, leagues.id),
        eq(leagueMembers.userId, userId),
        inArray(leagueMembers.role, allowedRoles),
      )
    : and(eq(leagueMembers.leagueId, leagues.id), eq(leagueMembers.userId, userId));
  const [league] = await db
    .select(getTableColumns(leagues))
    .from(leagues)
    .innerJoin(leagueMembers, joinCriteria)
    .where(whereCondition);
  return league;
};
const getByIdWhereMember = async ({
  userId,
  leagueId,
  allowedRoles,
}: {
  userId: string;
  leagueId: string;
  allowedRoles?: LeagueMemberRole[];
}) => {
  const whereCondition = eq(leagues.id, leagueId);
  return await getWhereMember({ allowedRoles, userId, whereCondition });
};

const findBySlugWithUserRole = async ({
  userId,
  leagueSlug,
}: {
  userId: string;
  leagueSlug: string;
}) => {
  const [league] = await db
    .select({
      id: leagues.id,
      slug: leagues.slug,
      name: leagues.name,
      logoUrl: leagues.logoUrl,
      role: leagueMembers.role,
    })
    .from(leagues)
    .innerJoin(leagueMembers, eq(leagueMembers.leagueId, leagues.id))
    .where(and(eq(leagues.slug, leagueSlug), eq(leagueMembers.userId, userId)));
  return league;
};

const create = async ({ name, logoUrl, userId }: z.infer<typeof LeagueCreate>) => {
  const slug = await slugifyLeagueName({ name });
  const now = new Date();
  const [league] = await db
    .insert(leagues)
    .values({
      id: createCuid(),
      slug,
      name,
      logoUrl,
      updatedBy: userId,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  await db.insert(leagueMembers).values({
    id: createCuid(),
    leagueId: league?.id ?? "",
    userId: userId,
    role: "owner",
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(leaguePlayers).values({
    id: createCuid(),
    leagueId: league?.id ?? "",
    userId: userId,
    createdAt: now,
    updatedAt: now,
  });
  return league;
};

const update = async ({ name, logoUrl, id, userId }: z.infer<typeof LeagueEdit>) => {
  const slug = name ? await slugifyLeagueName({ name }) : undefined;
  const now = new Date();
  await db
    .update(leagues)
    .set({
      slug,
      name,
      logoUrl,
      updatedBy: userId,
      updatedAt: now,
    })
    .where(eq(leagues.id, id));

  return db.query.leagues.findFirst({ where: eq(leagues.id, id) });
};

export const LeagueRepository = {
  create,
  update,
  findBySlug,
  getByIdWhereMember,
  findBySlugWithUserRole,
  getLeagueById,
  getUserLeagues,
  hasLeagueEditorAccess,
};
