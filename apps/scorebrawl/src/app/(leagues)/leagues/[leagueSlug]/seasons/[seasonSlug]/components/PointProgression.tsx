"use client";
import { transformData } from "@/app/(leagues)/leagues/[leagueSlug]/seasons/[seasonSlug]/components/utils/chartUtils";
import { useSeason } from "@/context/SeasonContext";
import { api } from "@/trpc/react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@scorebrawl/ui/charts";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

export const PointProgression = () => {
  const { seasonSlug, leagueSlug } = useSeason();
  const { data: seasonPlayers } = api.seasonPlayer.getAll.useQuery({ leagueSlug, seasonSlug });
  const { data } = api.seasonPlayer.getPointProgression.useQuery({ leagueSlug, seasonSlug });
  const chartData = transformData(data);
  const chartConfig: Record<string, { label: string; color: string }> = {};
  let counter = 0;

  if (seasonPlayers === undefined) return null;
  const allChartKeys = Array.from(
    new Set(
      chartData.flatMap((item) => {
        const { label, labelDetail, ...rest } = item;
        return Object.keys(rest);
      }),
    ),
  );
  for (const seasonPlayerId of allChartKeys) {
    chartConfig[seasonPlayerId] = {
      label: seasonPlayers?.find((sp) => sp.seasonPlayerId === seasonPlayerId)?.user.name ?? "",
      color: `hsl(var(--chart-${(counter % 5) + 1}))`,
    };
    counter++;
  }

  return (
    <ChartContainer config={chartConfig}>
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
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        {chartData.length > 0 &&
          allChartKeys.map((key) => {
            console.log("key", key);
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
