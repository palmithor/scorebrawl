import { getPlayers, getPointProgression } from "@/actions/season";
import { Data, PointProgressionChart } from "@/components/charts/PointProgression";

export const SeasonPlayerPointProgression = async ({
  seasonId,
}: {
  seasonId: string;
}) => {
  const pointProgression = await getPointProgression({ seasonId });
  const seasonPlayers = await getPlayers({ seasonId });

  const playerNames: Record<string, string> = {};
  for (const player of seasonPlayers) {
    playerNames[player.id] = player.name;
  }

  const data = Object.values(
    pointProgression.reduce<Record<string, Data>>((total, pp) => {
      const playerName = playerNames[pp.seasonPlayerId];
      if (!playerName) {
        return total;
      }

      const value = total[pp.date];
      if (!value) {
        total[pp.date] = { date: pp.date, [playerName]: pp.elo };
      } else {
        value[playerName] = pp.elo;
      }

      return total;
    }, {}),
  );
  return (
    <div className="rounded-md border min-h-[20rem]">
      <PointProgressionChart
        data={data.sort((a, b) => a.date.localeCompare(b.date))}
      />
    </div>
  );
};
