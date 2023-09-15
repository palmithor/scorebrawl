import type z from "zod";
import { describe, expect, test } from "vitest";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { appRouter } from "~/server/api/root";
import type { SignedInAuthObject } from "@clerk/nextjs/server";
import { faker } from "@faker-js/faker";
import { createLeague } from "~/test-helper/league.data-generator";
import { type NextApiRequest } from "next";
import { and, eq } from "drizzle-orm";
import { leagueMembers } from "~/server/db/schema";
import { type create } from "./league.schema";

describe("leagueRouter", () => {
  const ctx = createInnerTRPCContext({
    auth: { userId: "userId" } as SignedInAuthObject,
  });
  const caller = appRouter.createCaller({ ...ctx, req: {} as NextApiRequest });

  describe("createLeague", () => {
    test("should create league", async () => {
      const imageUrl = faker.image.url();
      const input: z.infer<typeof create> = {
        logoUrl: imageUrl,
        name: "Rocket League",
        visibility: "public",
      };

      const league = await caller.league.create(input);

      expect(league?.name).toEqual("Rocket League");
      expect(league?.slug).toEqual("rocket-league");
      expect(league?.logoUrl).toEqual(imageUrl);
      expect(league?.archived).toBe(false);
      expect(league?.id).toBeTruthy();
      expect(league?.createdAt).toBeTruthy();
      expect(league?.updatedAt).toBeTruthy();
      expect(league?.visibility).toEqual("public");
      expect(league?.createdBy).toEqual("userId");
      expect(league?.updatedBy).toEqual("userId");
    });

    test("should add counter to slug when exists", async () => {
      const imageUrl = faker.image.url();
      const input: z.infer<typeof create> = {
        logoUrl: imageUrl,
        name: "Rocket League",
        visibility: "public",
      };

      await caller.league.create(input);
      const league = await caller.league.create(input);

      expect(league?.slug).toEqual("rocket-league-1");
    });

    test("should set creator as owner", async () => {
      const input: z.infer<typeof create> = {
        logoUrl: faker.image.url(),
        name: "Rocket League",
        visibility: "public",
      };
      const league = await caller.league.create(input);

      const member = await ctx.db.query.leagueMembers.findFirst({
        where: and(
          eq(leagueMembers.leagueId, league?.id || ""),
          eq(leagueMembers.userId, "userId"),
        ),
      });

      expect(member?.role).toEqual("owner");
    });
  });

  describe("getAllLeagues", () => {
    test("should return all leagues where member and public", async () => {
      await createLeague({
        name: "privateOther",
        visibility: "private",
        leagueOwner: "other",
      });

      await createLeague({
        name: "privateMine",
        visibility: "private",
        leagueOwner: ctx.auth.userId as string,
      });
      await createLeague({
        name: "privateMember",
        leagueOwner: "other",
        visibility: "private",
        members: [{ userId: ctx.auth.userId as string, role: "member" }],
      });
      await createLeague({ name: "public", leagueOwner: "other" });

      const result = await caller.league.getAll({});
      expect(result?.nextCursor).toBeUndefined();

      expect(result.data.map((l) => l.name)).toEqual(["privateMember", "privateMine", "public"]);
    });
  });
});
