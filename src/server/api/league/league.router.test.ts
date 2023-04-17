import { expect, describe, test } from "vitest";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { type AppRouter, appRouter } from "~/server/api/root";
import type { inferProcedureInput } from "@trpc/server";
import type { SignedInAuthObject } from "@clerk/nextjs/dist/api";
import { faker } from "@faker-js/faker";
import { LeagueMemberRole } from "@prisma/client";
import slugify from "@sindresorhus/slugify";

type CreateLeagueInput = inferProcedureInput<AppRouter["league"]["create"]>;

describe("leagueRouter", () => {
  const ctx = createInnerTRPCContext({
    auth: { userId: "userId" } as SignedInAuthObject,
  });
  const caller = appRouter.createCaller(ctx);

  describe("createLeague", () => {
    test("should create league", async () => {
      const imageUrl = faker.image.imageUrl();
      type Input = inferProcedureInput<AppRouter["league"]["create"]>;
      const input: Input = {
        logoUrl: imageUrl,
        name: "Rocket League",
        initialElo: 1200,
      };

      const league = await caller.league.create(input);

      expect(league.name).toEqual("Rocket League");
      expect(league.nameSlug).toEqual("rocket-league");
      expect(league.logoUrl).toEqual(imageUrl);
      expect(league.archived).toBe(false);
      expect(league.id).toBeTruthy();
      expect(league.createdAt).toBeTruthy();
      expect(league.updatedAt).toBeTruthy();
      expect(league.isPrivate).toBeFalsy();
      expect(league.createdBy).toEqual("userId");
      expect(league.updatedBy).toEqual("userId");
    });

    test("should add counter to slug when exists", async () => {
      const imageUrl = faker.image.imageUrl();
      const input = {
        logoUrl: imageUrl,
        name: "Rocket League",
        initialElo: 1200,
      };

      await caller.league.create(input);
      const league = await caller.league.create(input);

      expect(league.nameSlug).toEqual("rocket-league-1");
    });

    test("should set creator as owner", async () => {
      const input = {
        logoUrl: faker.image.imageUrl(),
        name: "Rocket League",
        initialElo: 1200,
      };
      const league = await caller.league.create(input);

      const member = await ctx.prisma.leagueMember.findUnique({
        where: { leagueMember: { leagueId: league?.id, userId: "userId" } },
      });

      expect(member?.role).toEqual("owner");
    });
  });

  describe("getAllLeagues", () => {
    test("should return all leagues where member and public", async () => {
      await createLeague({
        name: "privateOther",
        isPrivate: true,
        leagueOwner: "other",
      });
      await createLeague({
        name: "privateMine",
        isPrivate: true,
        leagueOwner: ctx.auth.userId as string,
      });
      await createLeague({
        name: "privateMember",
        leagueOwner: "other",
        isPrivate: true,
        members: [
          { userId: ctx.auth.userId as string, role: LeagueMemberRole.member },
        ],
      });
      await createLeague({ name: "public", leagueOwner: "other" });

      const result = await caller.league.getAllLeagues({});
      expect(result.nextCursor).toBeUndefined();
      expect(result.data.map((l) => l.name)).toEqual([
        "privateMine",
        "privateMember",
        "public",
      ]);
    });
  });

  const createLeague = async ({
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
    const league = await ctx.prisma.league.create({
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
          ctx.prisma.leagueMember.create({
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
});
