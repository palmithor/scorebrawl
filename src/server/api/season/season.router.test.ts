import { TRPCError } from "@trpc/server";
import { describe, expect, test } from "vitest";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { createLeague } from "~/test-helper/league.data-generator";
import { createSeason } from "~/test-helper/season.data-generator";
import { type NextApiRequest } from "next";
import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import { seasons } from "~/server/db/schema";
import { type SignedInAuthObject } from "@clerk/nextjs/server";

describe("seasonRouter", () => {
  const ctx = createInnerTRPCContext({
    auth: { userId: "userId" } as SignedInAuthObject,
  });
  const caller = appRouter.createCaller({ ...ctx, req: {} as NextApiRequest });

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
      expect(season.createdBy).toEqual("userId");
      expect(season.updatedBy).toEqual("userId");
    });

    test.skip("should fail when user is not editor or owner of league - bug in bun", async () => {
      const league = await createLeague({ leagueOwner: "other" });
      await expect(
        caller.season.create({
          leagueSlug: league.slug,
          name: "Q2 2023",
          startDate: new Date("2023-04-19"),
        }),
      ).rejects.toThrow(new TRPCError({ code: "FORBIDDEN" }));
    });

    test.skip("should fail when season intersects another season - bug in bun", async () => {
      const league = await createLeague();

      await caller.season.create({
        leagueSlug: league.slug,
        name: "first",
        startDate: new Date("2023-04-01"),
        endDate: new Date("2023-04-10"),
      });

      await expect(
        caller.season.create({
          leagueSlug: league.slug,
          name: "Second",
          startDate: new Date("2023-04-05"),
        }),
      ).rejects.toThrow(
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
