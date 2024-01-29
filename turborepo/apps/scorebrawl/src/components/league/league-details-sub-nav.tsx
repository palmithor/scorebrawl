"use client";

import { join } from "@/actions/league";
import { EllipsisVerticalIcon, PlusIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import { LeagueOmitCode, Season } from "@scorebrawl/db/src/types";
import { Button } from "@scorebrawl/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@scorebrawl/ui/dropdown-menu";
import { LoadingButton } from "@scorebrawl/ui/loading-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@scorebrawl/ui/tooltip";
import { useToast } from "@scorebrawl/ui/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubNav } from "../layout/sub-nav";

type LeagueDetailsSubNavProps = React.HTMLAttributes<HTMLDivElement> & {
  league: LeagueOmitCode;
  ongoingSeason?: Season;
  shouldShowJoin: boolean;
  inviteCode?: string;
  shouldShowAddMatch: boolean;
  shouldEnableAddMatch: boolean;
  hasEditorAccess: boolean;
};

export const LeagueDetailsSubNav = ({
  league,
  inviteCode,
  shouldShowJoin,
  shouldShowAddMatch,
  shouldEnableAddMatch,
  hasEditorAccess,
  ongoingSeason,
}: LeagueDetailsSubNavProps) => {
  const [isJoiningLeague, setIsJoiningLeague] = useState(false);
  const { push, refresh } = useRouter();
  const { toast } = useToast();
  const links = constructLinks(league);

  return (
    <SubNav links={links}>
      {shouldShowJoin && (
        <LoadingButton
          variant="ghost"
          size="sm"
          loading={isJoiningLeague}
          onClick={async () => {
            setIsJoiningLeague(true);
            try {
              await join({ code: inviteCode ?? "" });
              refresh();
              toast({
                title: "League joined",
                description: `${league.name} has been added to your leagues.`,
              });
            } catch {
              setIsJoiningLeague(false);
            }
          }}
        >
          <UserPlusIcon className="mr-2 h-4 w-4" />
          Join League
        </LoadingButton>
      )}
      {shouldShowAddMatch && (
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void push(`/leagues/${league.slug}/seasons/ongoing/matches/create`)}
              disabled={!shouldEnableAddMatch}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Match
            </Button>
          </TooltipTrigger>
          {!shouldEnableAddMatch && (
            <TooltipContent>
              <p className="w-52">
                An ongoing season or at least two players required for adding match
              </p>
            </TooltipContent>
          )}
        </Tooltip>
      )}
      {hasEditorAccess && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-9 px-0">
              <EllipsisVerticalIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => void push(`/leagues/${league.slug}/edit`)}
            >
              Edit League
            </DropdownMenuItem>
            {!!inviteCode && (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() =>
                  void navigator.clipboard
                    .writeText(
                      `${window.location.origin.toString()}/leagues/auto-join/${inviteCode}`,
                    )
                    .then(() =>
                      toast({
                        description: "Auto join link copied",
                      }),
                    )
                }
              >
                Copy Invite Link
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => void push(`/leagues/${league.slug}/seasons/create`)}
            >
              Add Season
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </SubNav>
  );
};
const constructLinks = ({ slug }: { slug: string }) => [
  {
    name: "Overview",
    href: `/leagues/${slug}/overview`,
  },
  {
    name: "Seasons",
    href: `/leagues/${slug}/seasons`,
  },
  {
    name: "Players",
    href: `/leagues/${slug}/players`,
  },
];
