import { getByIdOrOngoing, getPlayers } from "@/actions/season";
import { SeasonPlayerStanding } from "@/components/league/overview/season-standing";
import { MatchForm } from "@/components/match/match-form";
import { Title } from "@/components/title";
import { Season } from "@scorebrawl/db/types";

export default async function ({ params }: { params: { leagueSlug: string; seasonId: string } }) {
  const season = (await getByIdOrOngoing(params)) as Season;
  const players = await getPlayers({ seasonId: season.id });

  return (
    <div className="grid gap-8">
      <MatchForm leagueSlug={params.leagueSlug} season={season} seasonPlayers={players} />
      <div className="container">
        <Title className="mb-4" title="Season Standing" />
        <SeasonPlayerStanding seasonId={season.id} excludeMatchesColumn />
      </div>
    </div>
  );
}
