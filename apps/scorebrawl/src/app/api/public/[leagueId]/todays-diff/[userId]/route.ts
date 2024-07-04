import { SeasonRepository } from "@scorebrawl/db";
import type { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { leagueId: string; userId: string } },
) {
  const result = await SeasonRepository.getTodayDiff({
    leagueId: params.leagueId as string,
    userId: params.userId as string,
  });
  return Response.json({ diff: result.diff });
}
