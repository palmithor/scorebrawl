import { faker } from "@faker-js/faker";
import slugify from "@sindresorhus/slugify";
import { db } from "~/server/db";
import { createCuid, seasons } from "~/server/db/schema";
import { type NewSeason, type Season } from "~/server/db/types";
import { testCtx } from "../../tests/util";

export const createSeason = async ({
  leagueId = "",
  name = faker.company.name(),
  startDate = new Date(),
  initialElo = 1200,
  kFactor = 32,
  userId = testCtx.auth.userId as string,
  endDate = undefined,
}: Partial<NewSeason & { userId: string }> = {}): Promise<Season> => {
  const now = new Date();
  return db
    .insert(seasons)
    .values({
      id: createCuid(),
      name,
      slug: slugify(name),
      leagueId,
      startDate,
      endDate,
      initialElo,
      kFactor,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId,
    })
    .returning()
    .get();
};
