import { prisma } from "~/server/db";
import { beforeEach } from "vitest";

beforeEach(async () => {
  await prisma.league.deleteMany();
});
