import { getPlayers, getPlayersForm } from "@/actions/season";
import { Standing } from "@/components/standing/standing";

export const SeasonPlayerStanding = async ({
  seasonId,
  excludeMatchesColumn,
}: { seasonId: string; excludeMatchesColumn?: boolean }) => {
  const seasonPlayers = await getPlayers({ seasonId });
  const seasonPlayersForm = await getPlayersForm({ seasonPlayers });

  return (
    <Standing
      excludeMatchesColumn={excludeMatchesColumn}
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
  );
};
