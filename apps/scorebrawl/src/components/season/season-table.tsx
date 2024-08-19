"use client";

import { api } from "@/trpc/react";
import { sortSeasons } from "@/utils/seasonUtils";
import { AvatarName } from "@scorebrawl/ui/avatar-name";
import { MultiAvatar } from "@scorebrawl/ui/multi-avatar";
import { Skeleton } from "@scorebrawl/ui/skeleton";
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
import { useRouter } from "next/navigation";

const TopPlayerCell = ({ seasonSlug, leagueSlug }: { seasonSlug: string; leagueSlug: string }) => {
  const { data } = api.seasonPlayer.getTop.useQuery({ leagueSlug, seasonSlug });

  if (!data) {
    return null;
  }
  return (
    <AvatarName
      textClassName={"text-xs"}
      avatarClassName={"h-8 w-8"}
      name={data.user.name}
      imageUrl={data.user.imageUrl}
    />
  );
};

const TopTeamCell = ({ seasonSlug, leagueSlug }: { seasonSlug: string; leagueSlug: string }) => {
  const { data } = api.seasonTeam.getTop.useQuery({ leagueSlug, seasonSlug });
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
  leagueSlug,
  showTopPlayerAndTeam,
}: {
  leagueSlug: string;
  showTopPlayerAndTeam?: boolean;
}) => {
  const { push } = useRouter();
  const { data, isLoading } = api.season.getAll.useQuery({ leagueSlug });
  const { data: hasEditorAccess } = api.league.hasEditorAccess.useQuery({ leagueSlug });
  const seasons = sortSeasons(data ?? []);
  return (
    <>
      {isLoading && <Skeleton className="h-96 w-full" />}
      {!isLoading && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              {showTopPlayerAndTeam && <TableHead>Top Player</TableHead>}
              {showTopPlayerAndTeam && <TableHead>Top Team</TableHead>}
              {hasEditorAccess && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody className="relative w-full">
            {seasons?.map((season) => {
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
                <TableRow
                  key={season.id}
                  className="cursor-pointer"
                  onClick={() => push(`/leagues/${leagueSlug}/seasons/${season.slug}`)}
                >
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger>
                        <StatusIcon className={"h-6 w-6 pointer-events-none"} />
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
                        <TopPlayerCell seasonSlug={season.slug} leagueSlug={leagueSlug} />
                      </TableCell>
                      <TableCell>
                        <TopTeamCell seasonSlug={season.slug} leagueSlug={leagueSlug} />
                      </TableCell>
                    </>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </>
  );
};
