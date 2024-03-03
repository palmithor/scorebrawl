"use client";

import { LineChart } from "@tremor/react";
import { format } from "date-fns";
import "./tremor.css";

export type Data = { [x: string]: string | number; date: string };

export const PointProgressionChart = ({ data }: { data: Data[] }) => (
  <LineChart
    data={data}
    index="date"
    className="h-full"
    categories={[...new Set(data.flatMap((d) => Object.keys(d).filter((k) => k !== "date")))]}
    showYAxis={false}
    showXAxis={false}
    colors={[
      "zinc-400",
      "red-400",
      "orange-600",
      "amber-600",
      "yellow-600",
      "lime-600",
      "green-600",
      "emerald-600",
      "teal-600",
      "cyan-600",
      "sky-600",
      "blue-600",
      "indigo-600",
      "violet-600",
      "purple-600",
      "fuchsia-600",
      "pink-600",
      "rose-600",
    ]}
    customTooltip={(props) => {
      const { payload, active } = props;
      if (!active || !payload) {
        return null;
      }
      const date = payload?.[0]?.payload.date;
      if (!date) {
        return null;
      }
      return (
        <div className="flex flex-col w-56 gap-2 rounded-tremor-default border dark:border-gray-700 border-tremor-border bg-tremor-background dark:bg-background p-2 text-tremor-default shadow-tremor-dropdown">
          <div className="font-medium text-muted-foreground">{format(date, "do MMMM yyyy")}</div>
          <div className="flex flex-col flex-wrap gap-2">
            {payload
              .filter((data) => (data as { strokeOpacity: number }).strokeOpacity)
              .sort((a, b) => Number(b.value) - Number(a?.value))
              .map((category) => (
                <div
                  key={`${category.color}-${category.value}`}
                  className={"flex flex-1 space-x-2.5"}
                >
                  <div className={`flex w-1 flex-col bg-${category.color} rounded`} />
                  <div className="space-y-1">
                    <p className="text-tremor-content">{category.dataKey}</p>
                    <p className="font-medium text-tremor-content-emphasis">{category.value}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      );
    }}
    noDataText="No games have been played"
    autoMinValue
    showGridLines={false}
    curveType="linear"
    onValueChange={() => null} // needed for legend click functionality to work
  />
);
