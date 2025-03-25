import { getTodayDiff } from "@scorebrawl/db/season";
import type { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ leagueId: string; userId: string }> },
) {
  const { leagueId, userId } = await params;
  const result = await getTodayDiff({
    leagueId,
    userId,
  });
  return Response.json({ diff: result.diff });
}
