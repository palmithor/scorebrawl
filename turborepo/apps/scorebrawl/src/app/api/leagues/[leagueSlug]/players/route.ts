import { auth } from "@clerk/nextjs";
import { getLeagueBySlug, getLeaguePlayers } from "@scorebrawl/db";

export async function GET(request: Request, { params }: { params: { leagueSlug: string } }) {
  const league = await getLeagueBySlug({
    userId: auth().userId as string,
    slug: params.leagueSlug,
  });
  const leaguePlayers = await getLeaguePlayers({ leagueId: league.id });

  return Response.json(leaguePlayers);
}
