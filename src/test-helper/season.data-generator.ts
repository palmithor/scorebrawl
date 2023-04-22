import { faker } from "@faker-js/faker";
import { Prisma } from "@prisma/client";
import { inferProcedureInput } from "@trpc/server";
import { AppRouter } from "~/server/api/root";
import { prisma } from "~/server/db";

export const createSeason = async ({
  leagueId = "",
  name = faker.company.name(),
  startedAt = new Date(),
  userId = "userId",
}: Partial<Prisma.SeasonUncheckedCreateInput & { userId: string }> = {}) =>
  prisma.season.create({
    data: {
      name,
      leagueId,
      startedAt,
      createdBy: userId,
      updatedBy: userId,
    },
  });
