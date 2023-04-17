import { beforeEach, describe, test } from "vitest";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { type AppRouter, appRouter } from "~/server/api/root";
import type { inferProcedureInput } from "@trpc/server";
import type { SignedInAuthObject } from "@clerk/nextjs/dist/api";
import { faker } from "@faker-js/faker";

describe("seasonRouter", () => {
  describe("createSeason", () => {
    test("should create season", async () => {
      const ctx = createInnerTRPCContext({
        auth: { userId: "userId" } as SignedInAuthObject,
      });
      const caller = appRouter.createCaller(ctx);

      const imageUrl = faker.image.imageUrl();
      type Input = inferProcedureInput<AppRouter["league"]["create"]>;
      const input: Input = {
        logoUrl: imageUrl,
        name: "Rocket League",
        initialElo: 1200,
      };

      await caller.league.create(input);
    });
  });

  beforeEach(async () => {
    const prisma = createInnerTRPCContext({
      auth: {} as SignedInAuthObject,
    }).prisma;
    await prisma.league.deleteMany();
  });
});
