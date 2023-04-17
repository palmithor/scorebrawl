import { faker } from "@faker-js/faker";
import slugify from "@sindresorhus/slugify";
import { beforeEach, expect, describe, test } from "vitest";
import { prisma } from "~/server/db";
import { getByIdWhereMember } from "./league.repository";
import { type League, LeagueMemberRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";

describe("leagueRepository", () => {
  describe("getByIdWhereMember", () => {
    let existingLeague: League;

    beforeEach(async () => {
      const name = faker.company.name();
      existingLeague = await prisma.league.create({
        data: {
          initialElo: 1200,
          createdBy: "userId",
          updatedBy: "userId",
          name: name,
          nameSlug: slugify(name),
        },
      });
    });

    test("should get by id with default roles", async () => {
      await prisma.leagueMember.create({
        data: {
          role: LeagueMemberRole.member,
          userId: "userId",
          leagueId: existingLeague.id,
        },
      });

      const league = await getByIdWhereMember({
        leagueId: existingLeague.id,
        userId: "userId",
      });

      expect(league).not.toBeNull();
    });

    test("should not get when league does not exist", async () => {
      await expect(
        getByIdWhereMember({
          leagueId: "not-found",
          userId: "userId",
        })
      ).rejects.toThrow(new TRPCError({ code: "NOT_FOUND" }));
    });

    test("should not get when not member", async () => {
      await expect(
        getByIdWhereMember({
          leagueId: existingLeague.id,
          userId: "userId",
        })
      ).rejects.toThrow(new TRPCError({ code: "NOT_FOUND" }));
    });

    test("should not get when role not allowed", async () => {
      await prisma.leagueMember.create({
        data: { role: "member", userId: "userId", leagueId: existingLeague.id },
      });

      await expect(
        getByIdWhereMember({
          leagueId: existingLeague.id,
          userId: "userId",
          allowedRoles: ["owner"],
        })
      ).rejects.toThrow(new TRPCError({ code: "NOT_FOUND" }));
    });
  });
});
