import { getBySlug } from "@/actions/league";
import { getPlayersForm as getLeaguePlayersForm } from "@/actions/league";
import {
  findOngoing,
  getForm as getSeasonPlayersForm,
  getMatches,
  getPlayers,
} from "@/actions/season";
import { LatestMatchCard } from "@/components/league/overview/latest-match-card";
import { PlayerFormCard } from "@/components/league/overview/player-form-card";
import { LeagueStatsCard } from "@/components/league/overview/stats-card";
import { Standing } from "@/components/standing/standing";

export default async function ({ params }: { params: { leagueSlug: string } }) {
  const league = await getBySlug(params);
  const ongoingSeason = await findOngoing({ leagueId: league.id });
  const seasonPlayers = ongoingSeason ? await getPlayers({ seasonId: ongoingSeason.id }) : [];
  const seasonMatches = ongoingSeason ? await getMatches({ seasonId: ongoingSeason.id }) : [];
  const seasonPlayersForm = ongoingSeason ? await getSeasonPlayersForm({ seasonPlayers }) : [];
  const leaguePlayersForm =
    seasonPlayers.length > 0 ? await getLeaguePlayersForm({ leagueId: league.id }) : [];
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
        {ongoingSeason && (
          <Standing
            items={seasonPlayers.map((sp) => ({
              id: sp.id,
              name: sp.name,
              elo: sp.elo,
              form: seasonPlayersForm.find((pf) => pf.id === sp.id)?.form ?? [],
              matchCount: sp.matchCount,
              pointDiff: sp.todaysPointsDiff,
              avatars: [{ id: sp.userId, imageUrl: sp.imageUrl, name: sp.name }],
            }))}
          />
        )}
      </div>
    </div>
  );
}
