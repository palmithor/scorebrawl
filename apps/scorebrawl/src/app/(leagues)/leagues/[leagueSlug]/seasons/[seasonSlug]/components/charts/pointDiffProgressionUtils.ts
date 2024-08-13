import { type ChartData, getDateOfISOWeek, getWeekNumber } from "./utils";

type PointDiffInputData = {
  seasonPlayerId: string;
  matchDate: string;
  pointDiff: number;
};

const transformDailyData = (input: PointDiffInputData[]): ChartData[] => {
  const output: ChartData[] = [];

  for (const item of input) {
    const existingEntry = output.find((entry) => entry.label === item.matchDate);

    if (existingEntry) {
      existingEntry[item.seasonPlayerId] = item.pointDiff;
    } else {
      const newEntry: ChartData = {
        label: item.matchDate,
        [item.seasonPlayerId]: item.pointDiff,
      };
      output.push(newEntry);
    }
  }

  return output;
};

function transformWeeklyData(input: PointDiffInputData[]): ChartData[] {
  const weeklyData: { [week: string]: { [playerId: string]: number[] } } = {};

  for (const item of input) {
    const date = new Date(item.matchDate);
    const weekNumber = getWeekNumber(date);
    const weekKey = `${date.getFullYear()}-W${weekNumber.toString().padStart(2, "0")}`;

    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {};
    }

    if (!weeklyData[weekKey]?.[item.seasonPlayerId]) {
      // @ts-ignore
      weeklyData[weekKey][item.seasonPlayerId] = [];
    }

    // @ts-ignore
    weeklyData[weekKey][item.seasonPlayerId].push(item.pointDiff);
  }

  const output: ChartData[] = [];

  for (const [weekKey, playerData] of Object.entries(weeklyData)) {
    const [year, week] = weekKey.split("-W");
    const weekStart = getDateOfISOWeek(
      Number.parseInt(year as string),
      Number.parseInt(week as string),
    );
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const entry: ChartData = {
      label: weekKey,
      labelDescription: `${weekStart.toISOString().split("T")[0]} - ${
        weekEnd.toISOString().split("T")[0]
      }`,
    };

    for (const [playerId, pointDiffs] of Object.entries(playerData)) {
      const average = Math.round(
        pointDiffs.reduce((sum, diff) => sum + diff, 0) / pointDiffs.length,
      );
      entry[playerId] = Number.parseFloat(average.toFixed(2));
    }

    output.push(entry);
  }

  return output;
}

export function transformData(input?: PointDiffInputData[]): ChartData[] {
  if (input === undefined || input.length === 0) {
    return [];
  }
  // Sort the input data by date
  input.sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime());

  // Check if the date range spans more than three weeks
  const firstDate = new Date((input[0] as PointDiffInputData).matchDate);
  const lastDate = new Date((input[input.length - 1] as PointDiffInputData).matchDate);
  const dateSpan = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
  const spanMoreThanThreeWeeks = dateSpan > 35;

  if (spanMoreThanThreeWeeks) {
    return transformWeeklyData(input);
  }
  return transformDailyData(input);
}
