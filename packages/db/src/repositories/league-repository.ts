import {
  LeagueMembers,
  LeaguePlayers,
  Leagues,
  createCuid,
  db,
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
        eq(LeagueMembers.userId, userId),
        ilike(Leagues.name, `%${slugifyWithCustomReplacement(search)}%`),
      )
    : eq(LeagueMembers.userId, userId);

  return db
    .select(getTableColumns(Leagues))
    .from(Leagues)
    .innerJoin(LeagueMembers, eq(LeagueMembers.leagueId, Leagues.id))
    .where(where)
    .orderBy(asc(Leagues.slug));
};
const findBySlug = async ({
  userId,
  leagueSlug: slug,
}: {
  userId: string;
  leagueSlug: string;
}) => {
  const league = await db.query.Leagues.findFirst({
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
    .from(Leagues)
    .where(and(eq(Leagues.id, leagueId), canReadLeaguesCriteria({ userId })));
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
        eq(LeagueMembers.leagueId, Leagues.id),
        eq(LeagueMembers.userId, userId),
        inArray(LeagueMembers.role, allowedRoles),
      )
    : and(eq(LeagueMembers.leagueId, Leagues.id), eq(LeagueMembers.userId, userId));
  const [league] = await db
    .select(getTableColumns(Leagues))
    .from(Leagues)
    .innerJoin(LeagueMembers, joinCriteria)
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
  const whereCondition = eq(Leagues.id, leagueId);
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
      id: Leagues.id,
      slug: Leagues.slug,
      name: Leagues.name,
      logoUrl: Leagues.logoUrl,
      role: LeagueMembers.role,
    })
    .from(Leagues)
    .innerJoin(LeagueMembers, eq(LeagueMembers.leagueId, Leagues.id))
    .where(and(eq(Leagues.slug, leagueSlug), eq(LeagueMembers.userId, userId)));
  return league;
};

const create = async ({ name, logoUrl, userId }: z.infer<typeof LeagueCreate>) => {
  const slug = await slugifyLeagueName({ name });
  const now = new Date();
  const [league] = await db
    .insert(Leagues)
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
  await db.insert(LeagueMembers).values({
    id: createCuid(),
    leagueId: league?.id ?? "",
    userId: userId,
    role: "owner",
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(LeaguePlayers).values({
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
    .update(Leagues)
    .set({
      slug,
      name,
      logoUrl,
      updatedBy: userId,
      updatedAt: now,
    })
    .where(eq(Leagues.id, id));

  return db.query.Leagues.findFirst({ where: eq(Leagues.id, id) });
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
