import { getByIdOrOngoing, getPlayers } from "@/actions/season";
import { SeasonPlayerStanding } from "@/components/league/overview/season-player-standing";
import { MatchForm } from "@/components/match/match-form";
import { Title } from "@/components/title";
import type { Season } from "@scorebrawl/db/types";

export default async function ({ params }: { params: { leagueSlug: string; seasonId: string } }) {
  const season = (await getByIdOrOngoing(params.seasonId, params.leagueSlug)) as Season;
  if (!season) {
    return null;
  }
  const players = await getPlayers(season.id);

  return (
    <div className="grid gap-8">
      <MatchForm leagueSlug={params.leagueSlug} season={season} seasonPlayers={players} />
      <div className="container">
        <Title className="mb-4" title="Season Standing" />
        <SeasonPlayerStanding seasonId={season.id} />
      </div>
    </div>
  );
}
