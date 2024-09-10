"use client";

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
import { cn } from "@/lib/utils";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import type { PlayerForm } from "@scorebrawl/model";
import { FormDots } from "../league/player-form";
import { PointDiffText } from "./point-diff-text";

const CountText = ({ count }: { count: number }) => (
  <div className={cn(count === 0 ? "text-muted-foreground" : "")}>{count}</div>
);

export const Standing = ({
  items,
}: {
  items: {
    id: string;
    name: string;
    score: number;
    matchCount: number;
    winCount: number;
    drawCount: number;
    lossCount: number;
    avatars: { id: string; name: string; imageUrl: string }[];
    pointDiff: number | undefined;
    form: PlayerForm;
  }[];
}) => {
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
              <TableRow key={id}>
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
            ),
          )}
        </TableBody>
      </Table>
    </div>
  );
};
