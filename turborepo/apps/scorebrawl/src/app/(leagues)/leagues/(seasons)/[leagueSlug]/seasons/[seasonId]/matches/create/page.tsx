import { getByIdOrOngoing, getPlayers } from "@/actions/season";
import { MatchForm } from "@/components/match/match-form";
import { Season } from "@scorebrawl/db/src/types";

export default async function ({ params }: { params: { leagueSlug: string; seasonId: string } }) {
  const season = (await getByIdOrOngoing(params)) as Season;
  const players = await getPlayers({ seasonId: season.id });

  return <MatchForm leagueSlug={params.leagueSlug} season={season} seasonPlayers={players} />;
}
