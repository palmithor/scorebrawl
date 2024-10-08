import { auth } from "@clerk/nextjs/server";
import { findBySlug } from "@scorebrawl/db/league";
import { getLeaguePlayers } from "@scorebrawl/db/player";

export async function GET(_request: Request, { params }: { params: { leagueSlug: string } }) {
  const league = await findBySlug({
    userId: auth().userId as string,
    leagueSlug: params.leagueSlug,
  });
  if (!league) {
    return Response.json({ error: "League not found" }, { status: 404 });
  }
  const leaguePlayers = await getLeaguePlayers({ leagueId: league.id });

  return Response.json(leaguePlayers);
}
