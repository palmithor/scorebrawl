"use client";
import { api } from "@/trpc/react";

import { MultiAvatar } from "@/components/multi-avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { useSeason } from "@/context/season-context";
import { cn } from "@/lib/utils";
import type { PlayerForm } from "@/model";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { useState } from "react";
import { FormDots } from "../league/player-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { PointDiffText } from "./point-diff-text";
import { ScoreAverageChart } from "./score-average-chart";
import { WinRatioChart } from "./win-ratio-chart";

const CountText = ({ count }: { count: number }) => (
  <div className={cn(count === 0 ? "text-muted-foreground" : "")}>{count}</div>
);

export const Standing = ({
  items,
  enableRowClick = true,
}: {
  items: {
    id: string;
    name: string;
    score: number;
    matchCount: number;
    winCount: number;
    drawCount: number;
    lossCount: number;
    avatars: { id: string; name: string; image?: string }[];
    pointDiff: number | undefined;
    form: PlayerForm;
  }[];
  enableRowClick?: boolean;
}) => {
  const { leagueSlug, seasonSlug } = useSeason();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const sortedItems = items.sort((a, b) => {
    // Objects with matchCount=0 are moved to the end
    if (a.matchCount === 0 && b.matchCount !== 0) {
      return 1;
    }
    if (a.matchCount !== 0 && b.matchCount === 0) {
      return -1;
    }
    return b.score - a.score;
  });
  const { data: playerData = [], isLoading: isLoadingPlayerData } =
    api.seasonPlayer.getTeammateStatistics.useQuery(
      { leagueSlug, seasonSlug, seasonPlayerId: selectedPlayerId ?? "" },
      { enabled: !!selectedPlayerId },
    );

  return (
    <div className="rounded-md ">
      <Table>
        <TableHeader className="text-xs">
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-center">MP</TableHead>
            <TableHead className="text-center">W</TableHead>
            <TableHead className="text-center">D</TableHead>
            <TableHead className="text-center">L</TableHead>
            <TableHead className="text-center">
              <Tooltip>
                <TooltipTrigger>
                  <div>+/-</div>
                </TooltipTrigger>
                <TooltipContent>+/- points today</TooltipContent>
              </Tooltip>
            </TableHead>
            <TableHead className={"font-bold text-center"}>Pts</TableHead>
            <TableHead className="hidden md:table-cell text-center">Last 5</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-sm">
          {sortedItems.map(
            ({
              id,
              avatars,
              matchCount,
              name,
              score,
              form,
              pointDiff,
              winCount,
              drawCount,
              lossCount,
            }) => (
              <>
                <TableRow
                  key={id}
                  onClick={
                    enableRowClick
                      ? () => setSelectedPlayerId((prev) => (prev === id ? null : id))
                      : undefined
                  }
                  className={cn(
                    "cursor-pointer",
                    selectedPlayerId && selectedPlayerId !== id && "opacity-50",
                  )}
                >
                  <TableCell>
                    <div className="flex gap-2" key={id}>
                      <MultiAvatar users={avatars} visibleCount={5} />
                      <div className="grid items-center">
                        <p className="font-medium truncate">{name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center p-0 sm:p-2">
                    <CountText count={matchCount} />
                  </TableCell>
                  <TableCell className="text-center p-0 sm:p-2">
                    <CountText count={winCount} />
                  </TableCell>
                  <TableCell className="text-center p-0 sm:p-2">
                    <CountText count={drawCount} />
                  </TableCell>
                  <TableCell className="text-center p-0 sm:p-2">
                    <CountText count={lossCount} />
                  </TableCell>
                  <TableCell className="text-center p-0 sm:p-2">
                    <PointDiffText diff={pointDiff} />
                  </TableCell>
                  <TableCell
                    className={`text-center p-0 sm:p-2 ${
                      matchCount > 0 ? "font-bold" : "text-muted-foreground"
                    }`}
                  >
                    {score}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className={"flex justify-center"}>
                      <FormDots form={form} key={id} />
                    </div>
                  </TableCell>
                </TableRow>
                {selectedPlayerId === id && matchCount > 0 && (
                  <TableRow className="w-full">
                    <TableCell colSpan={8} className="w-full">
                      <Tabs defaultValue="averageTeammate">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="averageTeammate">Average Score</TabsTrigger>
                          <TabsTrigger value="winRatio">Win Ratio</TabsTrigger>
                        </TabsList>
                        <TabsContent value="winRatio">
                          <p className="text-xs text-muted-foreground">
                            Win ratio achieved with each player throughout the season.
                          </p>
                          <WinRatioChart data={playerData} loading={isLoadingPlayerData} />
                        </TabsContent>
                        <TabsContent value="averageTeammate">
                          <p className="text-xs text-muted-foreground">
                            Average Elo score achieved when playing alongside each player.
                          </p>
                          <ScoreAverageChart data={playerData} loading={isLoadingPlayerData} />
                        </TabsContent>
                      </Tabs>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ),
          )}
        </TableBody>
      </Table>
    </div>
  );
};
