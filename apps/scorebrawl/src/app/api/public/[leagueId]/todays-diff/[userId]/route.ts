import { getTodayDiff } from "@scorebrawl/db/season";
import type { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { leagueId: string; userId: string } },
) {
  const result = await getTodayDiff({
    leagueId: params.leagueId as string,
    userId: params.userId as string,
  });
  return Response.json({ diff: result.diff });
}
