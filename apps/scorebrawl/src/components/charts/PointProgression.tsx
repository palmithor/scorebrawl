"use client";
import { Tooltip } from "@scorebrawl/ui/tooltip";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

type DailyElo = { elo: number; date: string };
type Data = { label: string; data: DailyElo[] }[];

function transformDataForLineChart(data: Data) {
  const transformedData = data.map((player, index) => {
    return {
      name: player.label,
      data: player.data.map((entry) => ({
        date: entry.date,
        elo: entry.elo,
      })),
    };
  });

  return transformedData;
}

export const PointProgressionChart = ({ data }: { data: Data }) => {
  const transformedData = transformDataForLineChart(data);

  const numDataPoints = transformedData.reduce((acc, player) => acc + player.data.length, 0);
  const width = Math.max(numDataPoints * 10, 800); // Adjust the width based on the number of data points
  console.log(transformedData);
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={transformedData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        {transformedData.map((player) => (
          <Line
            width={width}
            key={player.name}
            type="monotone"
            dataKey="elo"
            data={player.data}
            name={player.name}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};
