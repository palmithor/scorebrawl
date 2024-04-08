import { getTodaysDiff } from "@scorebrawl/db";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { leagueId: string; userId: string } },
) {
  const result = await getTodaysDiff({
    leagueId: params.leagueId as string,
    userId: params.userId as string,
  });
  return Response.json({ diff: result.diff });
}
