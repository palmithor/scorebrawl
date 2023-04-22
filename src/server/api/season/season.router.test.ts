import { expect, describe, test, beforeEach } from "vitest";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { type AppRouter, appRouter } from "~/server/api/root";
import type { inferProcedureInput } from "@trpc/server";
import type { SignedInAuthObject } from "@clerk/nextjs/dist/api";
import { faker } from "@faker-js/faker";
import { League, LeagueMemberRole } from "@prisma/client";
import slugify from "@sindresorhus/slugify";
import { prisma } from "~/server/db";
import { getByIdWhereMember } from "~/server/api/league/league.repository";
import { TRPCError } from "@trpc/server";
import { createLeague } from "~/test-helper/league.data-generator";
import { createSeason } from "~/test-helper/season.data-generator";

type CreateSeasonInput = inferProcedureInput<AppRouter["season"]["create"]>;

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
        startedAt: new Date("2023-04-19"),
      });

      expect(season.id).toBeTruthy();
      expect(season.name).toEqual("Q2 2023");
      expect(season.startedAt.toISOString()).toEqual(
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
          startedAt: new Date("2023-04-19"),
        })
      ).rejects.toThrow(new TRPCError({ code: "FORBIDDEN" }));
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

      const result = await caller.season.getAllSeasons({ leagueId: league.id });
      expect(result.nextCursor).toBeUndefined();
      expect(result.data.map((l) => l.name)).toEqual(["season2", "season1"]);
    });
  });

  describe("updateEndsAt", () => {
    test("should updateEndsAt", async () => {
      const league = await createLeague({});
      const season = await createSeason({
        name: "season1",
        leagueId: league.id,
      });

      const updatedSeason = await caller.season.updateEndsAt({
        seasonId: season.id,
        endsAt: new Date("2023-04-19"),
      });

      expect(updatedSeason.endsAt).toEqual(new Date("2023-04-19"));
      expect(
        await prisma.season.findFirst({
          where: { id: season.id },
          select: { endsAt: true },
        })
      ).toEqual({ endsAt: new Date("2023-04-19") });
    });
  });
});
