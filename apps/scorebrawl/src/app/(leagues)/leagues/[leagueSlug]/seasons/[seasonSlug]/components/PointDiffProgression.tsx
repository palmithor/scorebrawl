"use client";

import { EmptyCardContentText } from "@/components/state/EmptyCardContent";
import { useSeason } from "@/context/SeasonContext";
import { api } from "@/trpc/react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@scorebrawl/ui/charts";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { transformData } from "./charts/pointDiffProgressionUtils";
import { createChartConfig, getAllChartKeys } from "./charts/utils";

export const PointDiffProgression = () => {
  const { seasonSlug, leagueSlug } = useSeason();
  const { data: season } = api.season.findBySlug.useQuery({ leagueSlug, seasonSlug });
  const { data: seasonPlayers } = api.seasonPlayer.getAll.useQuery({ leagueSlug, seasonSlug });
  const { data } = api.seasonPlayer.getPointDiffProgression.useQuery({ leagueSlug, seasonSlug });

  if (seasonPlayers === undefined || !data || season === undefined) return null; // possibly loading state?
  const chartData = transformData({
    data,
    startDate: season.startDate,
  });

  if (chartData.length < 2) {
    return <EmptyCardContentText>Not enough data to display chart</EmptyCardContentText>;
  }
  const chartKeys = getAllChartKeys(chartData);
  const dataMin = Math.min(...data.map((key) => key.pointDiff)) - 10;
  const dataMax = Math.max(...data.map((key) => key.pointDiff)) + 10;

  return (
    <ChartContainer config={createChartConfig({ chartKeys, seasonPlayers })}>
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          angle={-90}
          textAnchor="end"
          tickMargin={8}
          hide={true}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis hide domain={[dataMin, dataMax]} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        {chartData.length > 0 &&
          chartKeys.map((key) => {
            return (
              <Line
                key={key}
                dataKey={key}
                type="monotone"
                stroke={`var(--color-${key})`}
                strokeWidth={2}
                dot={false}
              />
            );
          })}
      </LineChart>
    </ChartContainer>
  );
};
