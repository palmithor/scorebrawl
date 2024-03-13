import { getPlayerPointDiff, getPlayers, getPlayersForm } from "@/actions/season";
import { Standing } from "@/components/standing/standing";

export const SeasonPlayerStanding = async ({
  seasonId,
  excludeMatchesColumn,
}: { seasonId: string; excludeMatchesColumn?: boolean }) => {
  const seasonPlayers = await getPlayers({ seasonId });
  const seasonPlayersForm = await getPlayersForm({ seasonPlayers });
  const seasonPlayersPointDiff = await getPlayerPointDiff({
    seasonPlayerIds: seasonPlayers.map((sp) => sp.id),
  });

  return (
    <Standing
      items={seasonPlayers.map((sp) => ({
        id: sp.id,
        name: sp.name,
        score: sp.score,
        form: seasonPlayersForm.find((pf) => pf.id === sp.id)?.form ?? [],
        matchCount: sp.matchCount,
        winCount: sp.winCount,
        drawCount: sp.drawCount,
        lossCount: sp.lossCount,
        pointDiff:
          seasonPlayersPointDiff.find((ppd) => ppd.seasonPlayerId === sp.id)?.pointsDiff ?? 0,
        avatars: [{ id: sp.userId, imageUrl: sp.imageUrl, name: sp.name }],
      }))}
    />
  );
};
