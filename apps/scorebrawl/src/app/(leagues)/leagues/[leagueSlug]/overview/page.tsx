import { getBySlug } from "@/actions/league";
import { getPlayersForm as getLeaguePlayersForm } from "@/actions/league";
import { findOngoing, getMatches } from "@/actions/season";
import { LatestMatchCard } from "@/components/league/overview/latest-match-card";
import { LeagueOverviewTitleSection } from "@/components/league/overview/league-overview-title-section";
import { PlayerFormCard } from "@/components/league/overview/player-form-card";
import { SeasonPlayerStanding } from "@/components/league/overview/season-player-standing";
import { SeasonTeamStanding } from "@/components/league/overview/season-team-standing";
import { LeagueStatsCard } from "@/components/league/overview/stats-card";
import { MatchTable } from "@/components/match/match-table";
import { SeasonPlayerPointProgression } from "@/components/season/season-player-point-progression";

export default async function ({ params }: { params: { leagueSlug: string } }) {
  const league = await getBySlug(params);
  const ongoingSeason = await findOngoing({ leagueId: league.id });

  const seasonMatches = ongoingSeason
    ? await getMatches({ seasonId: ongoingSeason.id })
    : { data: [] };
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
      {/* todo no ongoing season view */}
      <div className="grid gap-4 m:grid-cols-1 lg:grid-cols-2 items-start">
        {ongoingSeason && (
          <>
            <LeagueOverviewTitleSection title="Player Standing">
              <SeasonPlayerStanding seasonId={ongoingSeason.id} />
            </LeagueOverviewTitleSection>
            <LeagueOverviewTitleSection title="Points Progression" className="h-full">
              <SeasonPlayerPointProgression seasonId={ongoingSeason.id} />
            </LeagueOverviewTitleSection>
            <LeagueOverviewTitleSection title="Team Standing">
              <SeasonTeamStanding seasonId={ongoingSeason.id} />
            </LeagueOverviewTitleSection>
            {seasonMatches.data.length > 0 && (
              <LeagueOverviewTitleSection title="Matches">
                <div className="rounded-md border">
                  <MatchTable matches={seasonMatches.data} />
                </div>
              </LeagueOverviewTitleSection>
            )}
          </>
        )}
      </div>
    </div>
  );
}
