import { getBySlug } from "@/actions/league";
import { getPlayersForm } from "@/actions/league";
import { findOngoing, getMatches, getPlayers } from "@/actions/season";
import { LatestMatchCard } from "@/components/league/overview/latest-match-card";
import { PlayerFormCard } from "@/components/league/overview/player-form-card";
import { LeagueStatsCard } from "@/components/league/overview/stats-card";

export default async function ({ params }: { params: { leagueSlug: string } }) {
  const league = await getBySlug(params);
  const ongoingSeason = await findOngoing({ leagueId: league.id });
  const seasonPlayers = ongoingSeason ? await getPlayers({ seasonId: ongoingSeason.id }) : [];
  const seasonMatches = ongoingSeason ? await getMatches({ seasonId: ongoingSeason.id }) : [];
  const seasonPlayerForm =
    seasonPlayers.length > 0 ? await getPlayersForm({ leagueId: league.id }) : [];
  const topFormPlayer = seasonPlayerForm.reduce((max, obj) =>
    obj.formScore > max.formScore ? obj : max,
  );
  const bottomFormPlayer = seasonPlayerForm.reduce((max, obj) =>
    obj.formScore < max.formScore ? obj : max,
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <PlayerFormCard player={topFormPlayer} state="top" />
      <PlayerFormCard player={bottomFormPlayer} state="bottom" />
      <LeagueStatsCard leagueId={league.id} />
      <LatestMatchCard leagueId={league.id} />
    </div>
  );
}
