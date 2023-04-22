import { faker } from "@faker-js/faker";
import { LeagueMemberRole } from "@prisma/client";
import slugify from "@sindresorhus/slugify";
import { inferProcedureInput } from "@trpc/server";
import { AppRouter } from "~/server/api/root";
import { prisma } from "~/server/db";

type CreateLeagueInput = inferProcedureInput<AppRouter["league"]["create"]>;

export const createLeague = async ({
  leagueOwner = "userId",
  initialElo = 1200,
  logoUrl = faker.image.imageUrl(),
  name = faker.company.name(),
  isPrivate = false,
  members = [],
}: Partial<
  CreateLeagueInput & {
    leagueOwner: string;
    members: { userId: string; role: LeagueMemberRole }[];
  }
> = {}) => {
  const league = await prisma.league.create({
    data: {
      createdBy: leagueOwner,
      updatedBy: leagueOwner,
      initialElo,
      logoUrl,
      name,
      isPrivate,
      nameSlug: slugify(name),
    },
  });

  await Promise.all(
    [{ userId: leagueOwner, role: LeagueMemberRole.owner }, ...members].map(
      (m) =>
        prisma.leagueMember.create({
          data: {
            userId: m.userId,
            role: m.role,
            leagueId: league.id,
          },
        })
    )
  );
  return league;
};
