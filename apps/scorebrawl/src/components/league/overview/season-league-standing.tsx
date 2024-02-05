import { getTeamPointDiff, getTeams, getTeamsForm } from "@/actions/season";
import { Standing } from "@/components/standing/standing";

export const SeasonTeamStanding = async ({
  seasonId,
  excludeMatchesColumn,
}: { seasonId: string; excludeMatchesColumn?: boolean }) => {
  const seasonTeams = await getTeams({ seasonId });
  const seasonTeamsForm = await getTeamsForm({ seasonTeams });
  const seasonTeamsPointDiff = await getTeamPointDiff({
    seasonTeamIds: seasonTeams.map((st) => st.id),
  });

  if (seasonTeams.length < 1) {
    return null;
  }

  return (
    <Standing
      excludeMatchesColumn={excludeMatchesColumn}
      items={seasonTeams.map((t) => ({
        id: t.id,
        name: t.name,
        elo: t.elo,
        form: seasonTeamsForm.find((tf) => tf.id === t.id)?.form ?? [],
        matchCount: t.matchCount,
        pointDiff: seasonTeamsPointDiff.find((ptd) => ptd.seasonTeamId === t.id)?.pointsDiff ?? 0,
        avatars: t.players,
      }))}
    />
  );
};
