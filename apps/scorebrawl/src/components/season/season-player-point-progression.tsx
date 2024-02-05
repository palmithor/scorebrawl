import { getPlayers, getPointProgression } from "@/actions/season";
import { PointProgressionChart } from "@/components/charts/PointProgression";

export const SeasonPlayerPointProgression = async ({ seasonId }: { seasonId: string }) => {
  const pointProgression = await getPointProgression({ seasonId });
  const seasonPlayers = await getPlayers({ seasonId });
  const series = seasonPlayers.map((sp) => ({
    label: sp.name,
    data: pointProgression
      .filter((pp) => pp.seasonPlayerId === sp.id)
      .map((pp) => ({
        elo: pp.elo,
        date: pp.date,
      })),
  }));

  return <PointProgressionChart data={series} />;
};
