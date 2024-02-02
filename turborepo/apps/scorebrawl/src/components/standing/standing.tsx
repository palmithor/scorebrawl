"use client";

import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { PlayerForm } from "@scorebrawl/api";
import { cn } from "@scorebrawl/ui/lib";
import { MultiAvatar } from "@scorebrawl/ui/multi-avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@scorebrawl/ui/table";
import { Tooltip, TooltipContent } from "@scorebrawl/ui/tooltip";
import { FormDots } from "../league/player-form";
import { PointDiffText } from "./point-diff-text";

export const Standing = ({
  className,
  excludeMatchesColumn = false,
  items,
}: {
  className?: string;
  excludeMatchesColumn?: boolean;
  items: {
    id: string;
    name: string;
    elo: number;
    matchCount: number;
    avatars: { id: string; name: string; imageUrl: string }[];
    pointDiff: number;
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
    return b.elo - a.elo;
  });

  return (
    <div className={className}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              {!excludeMatchesColumn && <TableHead>Matches</TableHead>}
              <TableHead>Form</TableHead>
              <TableHead>
                <Tooltip>
                  <TooltipTrigger>
                    <div>+/-</div>
                  </TooltipTrigger>
                  <TooltipContent>+/- points today</TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead>Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.map(({ id, avatars, matchCount, name, elo, form, pointDiff }) => (
              <TableRow key={id}>
                <TableCell>
                  <div className="flex gap-2" key={id}>
                    <MultiAvatar users={avatars} visibleCount={5} />
                    <div className="grid items-center">
                      <p className="text-sm font-medium truncate">{name}</p>
                    </div>
                  </div>
                </TableCell>
                {!excludeMatchesColumn && (
                  <TableCell>
                    <div className={cn(matchCount === 0 ? "text-muted-foreground" : "font-bold")}>
                      {matchCount}
                    </div>
                  </TableCell>
                )}
                <TableCell>
                  <TableCell>
                    <FormDots form={form} key={id} />
                  </TableCell>
                </TableCell>
                <TableCell>
                  <PointDiffText diff={pointDiff} />
                </TableCell>
                <TableCell>
                  <div className="font-bold">{matchCount < 1 ? "" : elo}</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
