import { auth } from "@clerk/nextjs";
import { LeagueRepository, PlayerRepository } from "@scorebrawl/db";

export async function GET(request: Request, { params }: { params: { leagueSlug: string } }) {
  const league = await LeagueRepository.getLeagueBySlug({
    userId: auth().userId as string,
    leagueSlug: params.leagueSlug,
  });
  const leaguePlayers = await PlayerRepository.getLeaguePlayers({ leagueId: league.id });

  return Response.json(leaguePlayers);
}
