import { getPlayers } from "@/actions/season";
import { SeasonPlayerStanding } from "@/components/league/overview/season-player-standing";
import { MatchForm } from "@/components/match/match-form";
import { Title } from "@/components/title";
import { api } from "@/trpc/server";

export default async function ({
  params: { leagueSlug, seasonSlug },
}: { params: { leagueSlug: string; seasonSlug: string } }) {
  const season = await api.season.findBySlug({ leagueSlug, seasonSlug });
  if (!season) {
    return null;
  }
  const players = await getPlayers(season.id, season.leagueId);

  return (
    <div className="grid gap-8">
      <MatchForm leagueSlug={leagueSlug} season={season} seasonPlayers={players} />
      <div className="container">
        <Title className="mb-4" title="Season Standing" />
        <SeasonPlayerStanding seasonId={season.id} leagueId={season.leagueId} />
      </div>
    </div>
  );
}
