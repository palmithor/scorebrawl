import { TRPCError } from "@trpc/server";
import { and, eq, gte, isNull, lte, or } from "drizzle-orm";
import { canReadLeaguesCriteria } from "~/server/api/league/league.repository";
import { db } from "~/server/db";
import { leagues, seasons } from "~/server/db/schema";

export const getSeasonById = async ({ seasonId, userId }: { seasonId: string; userId: string }) => {
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

export const getOngoingSeason = async ({ leagueId }: { leagueId: string }) => {
  const now = new Date();
  return db.query.seasons.findFirst({
    where: and(
      eq(seasons.leagueId, leagueId),
      lte(seasons.startDate, now),
      or(isNull(seasons.endDate), gte(seasons.endDate, now)),
    ),
  });
};
