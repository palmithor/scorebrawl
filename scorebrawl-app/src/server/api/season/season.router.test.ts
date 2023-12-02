import { TRPCError } from "@trpc/server";
import { describe, expect, test } from "bun:test";
import { createLeague } from "~/test-helper/league.data-generator";
import { createSeason } from "~/test-helper/season.data-generator";
import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import { seasons } from "~/server/db/schema";
import { testCtx } from "../../../../tests/util";
import { appRouter } from "~/server/api/root";
import { type NextApiRequest } from "next";

describe("seasonRouter", () => {
  const caller = appRouter.createCaller({ ...testCtx, req: {} as NextApiRequest });

  describe("createSeason", () => {
    test("should create season", async () => {
      const league = await createLeague();

      const season = await caller.season.create({
        leagueSlug: league.slug,
        name: "Q2 2023",
        startDate: new Date("2023-04-19"),
      });

      expect(season.id).toBeTruthy();
      expect(season.name).toEqual("Q2 2023");
      expect(season.startDate.toISOString()).toEqual("2023-04-19T00:00:00.000Z");
      expect(season.createdAt).toBeTruthy();
      expect(season.updatedAt).toBeTruthy();
      expect(season.createdBy).toEqual(testCtx.auth.userId);
      expect(season.updatedBy).toEqual(testCtx.auth.userId);
    });

    test("should fail when user is not editor or owner of league", async () => {
      const league = await createLeague({ leagueOwner: "other" });
      expect(
        async () =>
          await caller.season.create({
            leagueSlug: league.slug,
            name: "Q2 2023",
            startDate: new Date("2023-04-19"),
          }),
      ).toThrow(new TRPCError({ code: "FORBIDDEN" }));
    });

    test("should fail when season intersects another season", async () => {
      const league = await createLeague();

      await caller.season.create({
        leagueSlug: league.slug,
        name: "first",
        startDate: new Date("2023-04-01"),
        endDate: new Date("2023-04-10"),
      });

      expect(
        async () =>
          await caller.season.create({
            leagueSlug: league.slug,
            name: "Second",
            startDate: new Date("2023-04-05"),
          }),
      ).toThrow(
        new TRPCError({
          code: "CONFLICT",
          message: "There's an ongoing season during this period",
        }),
      );
    });
  });

  describe("getAllSeasons", () => {
    test("should return all seasons", async () => {
      const league = await createLeague({});
      await createSeason({
        name: "season1",
        startDate: new Date("2023-04-01"),
        endDate: new Date("2023-04-02"),
        leagueId: league.id,
      });
      await createSeason({
        name: "season2",
        startDate: new Date("2023-04-03"),
        leagueId: league.id,
      });

      const result = await caller.season.getAll({ leagueSlug: league.slug });
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
        await db.query.seasons.findFirst({
          where: eq(seasons.id, season.id),
          columns: { name: true, startDate: true, endDate: true },
        }),
      ).toEqual({
        name: "season2",
        startDate: new Date("2023-04-01"),
        endDate: new Date("2023-05-01"),
      });
    });
  });
});
