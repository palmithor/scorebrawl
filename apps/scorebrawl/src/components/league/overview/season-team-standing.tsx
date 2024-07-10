import { getTeamPointDiff, getTeams, getTeamsForm } from "@/actions/season";
import { Standing } from "@/components/standing/standing";

export const SeasonTeamStanding = async ({
  seasonId,
  leagueId,
}: { leagueId: string; seasonId: string }) => {
  const seasonTeams = await getTeams(seasonId, leagueId);
  const seasonTeamsForm = await getTeamsForm(seasonTeams);
  const seasonTeamsPointDiff = await getTeamPointDiff(seasonTeams.map((st) => st.id));

  if (seasonTeams.length < 1) {
    return null;
  }

  return (
    <Standing
      items={seasonTeams.map((t) => ({
        id: t.id,
        name: t.name,
        score: t.score,
        form: seasonTeamsForm.find((tf) => tf.id === t.id)?.form ?? [],
        matchCount: t.matchCount,
        winCount: t.winCount,
        drawCount: t.drawCount,
        lossCount: t.lossCount,
        pointDiff: seasonTeamsPointDiff.find((ptd) => ptd.seasonTeamId === t.id)?.pointsDiff ?? 0,
        avatars: t.players,
      }))}
    />
  );
};
