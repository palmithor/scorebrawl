import { faker } from "@faker-js/faker";
import slugify from "@sindresorhus/slugify";
import { beforeEach, expect, describe, test } from "vitest";
import { db } from "~/server/db";
import { getByIdWhereMember } from "./league.repository";
import { createCuid, leagueMembers, leagues } from "~/server/db/schema";
import { sql } from "drizzle-orm";
import { type LeagueModel } from "~/server/db/types";

describe("leagueRepository", () => {
  describe("getByIdWhereMember", () => {
    let existingLeague: LeagueModel;
    const now = new Date();

    beforeEach(async () => {
      const name = faker.company.name();
      existingLeague = await db
        .insert(leagues)
        .values({
          id: createCuid(),
          code: createCuid(),
          archived: false,
          createdAt: now,
          updatedAt: now,
          visibility: "public",
          logoUrl: faker.image.imageUrl(),
          createdBy: "userId",
          updatedBy: "userId",
          name: name,
          slug: slugify(name),
        })
        .returning()
        .get();
    });

    test("should get by id with default roles", async () => {
      await db
        .insert(leagueMembers)
        .values({
          id: createCuid(),
          role: "member",
          userId: "userId",
          leagueId: existingLeague.id,
          createdAt: now,
          updatedAt: now,
        })
        .run();

      const league = await getByIdWhereMember({
        leagueId: existingLeague.id,
        userId: "userId",
      });

      expect(league).not.toBeNull();
    });

    test("should not get when league does not exist", async () => {
      expect(
        await getByIdWhereMember({
          leagueId: "not-found",
          userId: "userId",
        })
      ).toBeUndefined();
    });

    test("should not get when not member", async () => {
      await db
        .select({
          count: sql<number>`count(*)`.mapWith(Number),
        })
        .from(leagueMembers)
        .get();
      expect(
        await getByIdWhereMember({
          leagueId: existingLeague.id,
          userId: "userId",
        })
      ).toBeUndefined();
    });

    test("should not get when role not allowed", async () => {
      await db
        .insert(leagueMembers)
        .values({
          id: createCuid(),
          role: "member",
          userId: "userId",
          leagueId: existingLeague.id,
          createdAt: now,
          updatedAt: now,
        })
        .run();

      expect(
        await getByIdWhereMember({
          leagueId: existingLeague.id,
          userId: "userId",
          allowedRoles: ["owner"],
        })
      );
    });
  });
});
