import { faker } from "@faker-js/faker";
import { type Prisma } from "@prisma/client";
import { prisma } from "~/server/db";

export const createSeason = async ({
  leagueId = "",
  name = faker.company.name(),
  startDate = new Date(),
  initialElo = 1200,
  kFactor = 32,
  userId = "userId",
  endDate = undefined,
}: Partial<Prisma.SeasonUncheckedCreateInput & { userId: string }> = {}) =>
  prisma.season.create({
    data: {
      name,
      leagueId,
      startDate,
      endDate,
      initialElo,
      kFactor,
      createdBy: userId,
      updatedBy: userId,
    },
  });
