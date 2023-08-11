import { leagues, seasons } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { canReadLeaguesCriteria } from "~/server/api/league/league.repository";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";

export const getSeason = async ({
  seasonId,
  userId,
}: {
  seasonId: string;
  userId: string;
}) => {
  const result = await db
    .select()
    .from(seasons)
    .innerJoin(leagues, eq(leagues.id, seasons.leagueId))
    .where(and(eq(seasons.id, seasonId), canReadLeaguesCriteria({ userId })))
    .get();
  if (!result?.season) {
    throw new TRPCError({ code: "NOT_FOUND", message: "season not found" });
  }
  return result.season;
};
