import { faker } from "@faker-js/faker";
import slugify from "@sindresorhus/slugify";
import { type inferProcedureInput } from "@trpc/server";
import { type AppRouter } from "~/server/api/root";
import { db } from "~/server/db";
import { createCuid, type LeagueMemberRole, leagueMembers, leagues } from "~/server/db/schema";

type CreateLeagueInput = inferProcedureInput<AppRouter["league"]["create"]>;

export const createLeague = async ({
  leagueOwner = "userId",
  logoUrl = faker.image.url(),
  name = faker.company.name(),
  visibility = "public",
  members = [],
}: Partial<
  CreateLeagueInput & {
    leagueOwner: string;
    members: { userId: string; role: LeagueMemberRole }[];
  }
> = {}) => {
  const now = new Date();
  const league = await db
    .insert(leagues)
    .values({
      id: createCuid(),
      code: createCuid(),
      name,
      slug: slugify(name),
      logoUrl,
      createdBy: leagueOwner,
      updatedBy: leagueOwner,
      visibility,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .get();

  await Promise.all(
    [{ userId: leagueOwner, role: "owner" as LeagueMemberRole }, ...members].map((m) =>
      db
        .insert(leagueMembers)
        .values({
          id: createCuid(),
          userId: m.userId,
          role: m.role,
          leagueId: league.id,
          createdAt: now,
          updatedAt: now,
        })
        .run(),
    ),
  );
  return league;
};
