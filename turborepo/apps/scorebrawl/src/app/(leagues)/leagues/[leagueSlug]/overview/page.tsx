import { getBySlug } from "@/actions/league";
import { getPlayersForm as getLeaguePlayersForm } from "@/actions/league";
import { findOngoing, getMatches } from "@/actions/season";
import { LatestMatchCard } from "@/components/league/overview/latest-match-card";
import { PlayerFormCard } from "@/components/league/overview/player-form-card";
import { SeasonPlayerStanding } from "@/components/league/overview/season-standing";
import { LeagueStatsCard } from "@/components/league/overview/stats-card";

export default async function ({ params }: { params: { leagueSlug: string } }) {
  const league = await getBySlug(params);
  const ongoingSeason = await findOngoing({ leagueId: league.id });

  const seasonMatches = ongoingSeason ? await getMatches({ seasonId: ongoingSeason.id }) : [];

  const leaguePlayersForm = await getLeaguePlayersForm({ leagueId: league.id });
  const topFormPlayer = leaguePlayersForm.reduce((max, obj) =>
    obj.formScore > max.formScore ? obj : max,
  );
  const bottomFormPlayer = leaguePlayersForm.reduce((max, obj) =>
    obj.formScore < max.formScore ? obj : max,
  );

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <PlayerFormCard player={topFormPlayer} state="top" />
        <PlayerFormCard player={bottomFormPlayer} state="bottom" />
        <LeagueStatsCard leagueId={league.id} />
        <LatestMatchCard leagueId={league.id} />
      </div>
      <div className="grid gap-4 m:grid-cols-1 lg:grid-cols-2">
        {ongoingSeason && <SeasonPlayerStanding seasonId={ongoingSeason.id} />}
      </div>
    </div>
  );
}
