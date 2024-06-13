import { getById, getPlayers, getPointProgression } from "@/actions/season";
import { PointProgressionChart } from "@/components/charts/PointProgression";
import type { Season } from "@scorebrawl/db/types";

interface DataPoint {
  seasonPlayerId: string;
  date: string;
  score: number;
}

interface UserNameMapping {
  [seasonPlayerId: string]: string;
}

interface ResultData {
  date: string;
  [userName: string]: number | string;
}

function generateDataForPeriod(
  season: Season,
  data: DataPoint[],
  userNameMapping: UserNameMapping,
): ResultData[] {
  const resultData: ResultData[] = [];
  const startDate = season.startDate;
  const initialScore = season.initialScore;
  for (
    let currentDate = new Date(startDate);
    currentDate <= new Date();
    currentDate.setDate(currentDate.getDate() + 1)
  ) {
    const currentDateStr = currentDate.toISOString().split("T")[0] as string;

    const currentDateData: ResultData = { date: currentDateStr };

    for (const userId in userNameMapping) {
      const userName = userNameMapping[userId] as string;

      const userDateData = data.find(
        (d) => d.seasonPlayerId === userId && d.date === currentDateStr,
      );

      if (userDateData) {
        currentDateData[userName] = userDateData.score;
      } else {
        // Use the last available elo for the user
        const lastUserData = data
          .filter((d) => d.seasonPlayerId === userId && new Date(d.date) < currentDate)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

        currentDateData[userName] = lastUserData ? lastUserData.score : initialScore;
      }
    }

    resultData.push(currentDateData);
  }

  return resultData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export const SeasonPlayerPointProgression = async ({
  seasonId,
}: {
  seasonId: string;
}) => {
  const season = await getById(seasonId);
  const pointProgression = await getPointProgression(seasonId);
  const seasonPlayers = await getPlayers(seasonId);
  const playerNames: Record<string, string> = {};
  for (const player of seasonPlayers) {
    playerNames[player.id] = player.name;
  }

  return (
    <div className="rounded-md border min-h-[20rem]">
      <PointProgressionChart data={generateDataForPeriod(season, pointProgression, playerNames)} />
    </div>
  );
};
