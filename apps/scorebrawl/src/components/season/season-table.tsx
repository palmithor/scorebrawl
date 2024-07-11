"use client";

import { api } from "@/trpc/react";
import type { Season } from "@scorebrawl/db/types";
import { AvatarName } from "@scorebrawl/ui/avatar-name";
import { MultiAvatar } from "@scorebrawl/ui/multi-avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@scorebrawl/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@scorebrawl/ui/tooltip";
import { getPeriodStatus } from "@scorebrawl/utils/date";
import { CircleCheck, CirclePlay, FastForward } from "lucide-react";

const TopPlayerCell = ({ seasonId }: { seasonId: string }) => {
  const { data } = api.player.getTopPlayer.useQuery({ seasonId });

  if (!data) {
    return null;
  }
  return (
    <AvatarName
      textClassName={"text-xs"}
      avatarClassName={"h-8 w-8"}
      name={data.name}
      imageUrl={data.imageUrl}
    />
  );
};

const TopTeamCell = ({ seasonId }: { seasonId: string }) => {
  const { data } = api.team.getTopTeam.useQuery({ seasonId });
  if (!data) {
    return null;
  }
  return (
    <div className="flex items-center">
      <div className="relative">
        <MultiAvatar users={data} visibleCount={3} />
      </div>
      <div className="ml-4">
        <h2 className={"text-xs"}>{data[0]?.teamName}</h2>
      </div>
    </div>
  );
};

/*const ActionMenu = ({ leagueSlug, seasonId }: { leagueSlug: string; seasonId: string }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-9 px-0">
          <EllipsisVerticalIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="cursor-pointer">Edit Season</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};*/

export const SeasonTable = ({
  hasEditorAccess,
  showTopPlayerAndTeam,
  seasons,
}: {
  hasEditorAccess?: boolean;
  showTopPlayerAndTeam?: boolean;
  seasons: (Season & { matchCount?: number; hasTeams?: boolean })[];
}) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Status</TableHead>
        <TableHead>Name</TableHead>
        <TableHead>Start Date</TableHead>
        <TableHead>End Date</TableHead>
        {seasons[0]?.matchCount && <TableHead>Matches</TableHead>}
        {showTopPlayerAndTeam && <TableHead>Top Player</TableHead>}
        {showTopPlayerAndTeam && <TableHead>Top Team</TableHead>}
        {hasEditorAccess && <TableHead>Actions</TableHead>}
      </TableRow>
    </TableHeader>
    <TableBody>
      {seasons.map((season) => {
        const periodStatus = getPeriodStatus(season);
        let StatusIcon = null;
        if (periodStatus === "ongoing") {
          StatusIcon = CirclePlay;
        } else if (periodStatus === "finished") {
          StatusIcon = CircleCheck;
        } else {
          StatusIcon = FastForward;
        }
        return (
          <TableRow key={season.id}>
            <TableCell>
              <Tooltip>
                <TooltipTrigger>
                  <StatusIcon className={"h-6 w-6"} />
                </TooltipTrigger>
                <TooltipContent className="capitalize">{periodStatus}</TooltipContent>
              </Tooltip>
            </TableCell>
            <TableCell>
              <p className="text-xs w-4/5"> {season.name}</p>
            </TableCell>
            <TableCell>
              <p className={"text-xs"}>
                {season.startDate.toLocaleDateString(window.navigator.language)}
              </p>
            </TableCell>
            <TableCell>
              <p className={"text-xs"}>
                {season.endDate
                  ? season.endDate.toLocaleDateString(window.navigator.language)
                  : "-"}
              </p>
            </TableCell>
            {showTopPlayerAndTeam && (
              <>
                <TableCell>
                  <TopPlayerCell seasonId={season.id} />
                </TableCell>
                <TableCell>
                  <TopTeamCell seasonId={season.id} />
                </TableCell>
              </>
            )}
            {seasons[0]?.matchCount && <TableCell>{season.matchCount}</TableCell>}
            {/*{hasEditorAccess && leagueSlug && (
                <TableCell>
                  <ActionMenu leagueSlug={leagueSlug} seasonId={season.id} />
                </TableCell>
              )}*/}
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
);
