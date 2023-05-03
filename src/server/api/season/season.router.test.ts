import type { SignedInAuthObject } from "@clerk/nextjs/dist/api";
import { TRPCError } from "@trpc/server";
import { describe, expect, test } from "vitest";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import { createLeague } from "~/test-helper/league.data-generator";
import { createSeason } from "~/test-helper/season.data-generator";

describe("seasonRouter", () => {
  const ctx = createInnerTRPCContext({
    auth: { userId: "userId" } as SignedInAuthObject,
  });
  const caller = appRouter.createCaller(ctx);

  describe("createSeason", () => {
    test("should create season", async () => {
      const league = await createLeague();

      const season = await caller.season.create({
        leagueId: league.id,
        name: "Q2 2023",
        startDate: new Date("2023-04-19"),
      });

      expect(season.id).toBeTruthy();
      expect(season.name).toEqual("Q2 2023");
      expect(season.startDate.toISOString()).toEqual(
        "2023-04-19T00:00:00.000Z"
      );
      expect(season.createdAt).toBeTruthy();
      expect(season.updatedAt).toBeTruthy();
      expect(season.createdBy).toEqual("userId");
      expect(season.updatedBy).toEqual("userId");
    });

    test("should fail when user is not editor or owner of league", async () => {
      const league = await createLeague({ leagueOwner: "other" });
      await expect(
        caller.season.create({
          leagueId: league.id,
          name: "Q2 2023",
          startDate: new Date("2023-04-19"),
        })
      ).rejects.toThrow(new TRPCError({ code: "FORBIDDEN" }));
    });

    test("should fail when season intersects another season", async () => {
      const league = await createLeague();

      await caller.season.create({
        leagueId: league.id,
        name: "first",
        startDate: new Date("2023-04-01"),
        endDate: new Date("2023-04-10"),
      });

      await expect(
        caller.season.create({
          leagueId: league.id,
          name: "Second",
          startDate: new Date("2023-04-05"),
        })
      ).rejects.toThrow(
        new TRPCError({
          code: "CONFLICT",
          message: "There's an ongoing season during this period",
        })
      );
    });
  });

  describe("getAllSeasons", () => {
    test("should return all seasons", async () => {
      const league = await createLeague({});
      await createSeason({
        name: "season1",
        leagueId: league.id,
      });
      await createSeason({
        name: "season2",
        leagueId: league.id,
      });

      const result = await caller.season.getAll({ leagueId: league.id });
      expect(result.nextCursor).toBeUndefined();
      expect(result.data.map((l) => l.name)).toEqual(["season2", "season1"]);
    });
  });

  describe("update", () => {
    test("should update name only", async () => {
      const league = await createLeague({});
      const season = await createSeason({
        name: "season1",
        leagueId: league.id,
        startDate: new Date("2023-04-01"),
        endDate: new Date("2023-05-01"),
      });

      const updatedSeason = await caller.season.update({
        seasonId: season.id,
        name: "season2",
      });

      expect(updatedSeason.name).toEqual("season2");
      expect(
        await prisma.season.findFirst({
          where: { id: season.id },
          select: { endDate: true, name: true, startDate: true },
        })
      ).toEqual({
        name: "season2",
        startDate: new Date("2023-04-01"),
        endDate: new Date("2023-05-01"),
      });
    });
  });
});
