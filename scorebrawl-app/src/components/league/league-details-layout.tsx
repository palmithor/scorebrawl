import * as React from "react";

import { useAuth, useUser } from "@clerk/nextjs";
import { DotsVerticalIcon, PlusIcon } from "@radix-ui/react-icons";
import Head from "next/head";
import { useRouter } from "next/router";
import { LeagueNav } from "~/components/league/league-nav";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { LoadingButton } from "~/components/ui/loading-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { useToast } from "~/components/ui/use-toast";
import { useLeagueInvalidation } from "~/hooks/useLeagueInvalidation";
import { useLeagueSlug } from "~/hooks/useLeagueSlug";
import { api } from "~/lib/api";

export const LeagueDetailsLayout = ({
  children,
  hideJoinButton,
}: {
  children: React.ReactNode;
  hideJoinButton?: boolean;
}) => {
  const { userId } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();
  const [isJoining, setIsJoining] = React.useState(false);
  const leagueSlug = useLeagueSlug();
  const invalidate = useLeagueInvalidation();
  const { data: league } = api.league.getBySlug.useQuery({ leagueSlug });
  const { mutateAsync: joinLeagueMutate } = api.league.join.useMutation();
  const { data: leaguePlayers } = api.league.getPlayers.useQuery({
    leagueSlug,
  });
  const { data: ongoingSeason } = api.season.getOngoing.useQuery({ leagueSlug }, { retry: false });
  const { data: seasonPlayers } = api.season.getPlayers.useQuery(
    { seasonId: ongoingSeason?.id as string },
    { enabled: !!ongoingSeason },
  );
  const hasTwoPlayersOrMore = seasonPlayers && seasonPlayers.length > 1;
  const { data: hasEditorAccess } = api.league.hasEditorAccess.useQuery({
    leagueSlug,
  });
  const { data: code } = api.league.getCode.useQuery(
    { leagueSlug },
    { enabled: !!league?.id, retry: false },
  );

  const shouldShowJoin =
    !hideJoinButton && code && !leaguePlayers?.some((u) => u?.userId === userId);

  const shouldShowInviteButton = !!code;

  const joinLeague = () => {
    setIsJoining(true);
    if (code) {
      joinLeagueMutate(
        { code },
        {
          onSuccess: () => {
            void invalidate();
          },
        },
      ).catch(() => setIsJoining(false));
    }
  };

  if (!league) {
    return null;
  }

  const canAddMatch = hasTwoPlayersOrMore && !!ongoingSeason;

  return (
    <div>
      <Head>
        <title>Scorebrawl - {league.name}</title>
      </Head>
      <LeagueNav>
        {shouldShowJoin && (
          <LoadingButton variant="outline" loading={isJoining} onClick={joinLeague}>
            Join League
          </LoadingButton>
        )}
        {leaguePlayers?.some((p) => p.userId === user?.id) && (
          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="ghost"
                onClick={() =>
                  void router.push(
                    `/leagues/${leagueSlug}/seasons/${ongoingSeason?.id}/matches/create`,
                  )
                }
                disabled={!canAddMatch}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Match
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {!canAddMatch && "at least two players required for adding match"}
            </TooltipContent>
          </Tooltip>
        )}
        {hasEditorAccess && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-9 px-0">
                <DotsVerticalIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => void router.push(`/leagues/${leagueSlug}/edit`)}
              >
                Edit League
              </DropdownMenuItem>
              {shouldShowInviteButton && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() =>
                    void navigator.clipboard
                      .writeText(`${window.location.origin.toString()}/leagues/auto-join/${code}`)
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
                onClick={() => void router.push(`/leagues/${leagueSlug}/seasons/create`)}
              >
                Add Season
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </LeagueNav>
      <div>{children}</div>
    </div>
  );
};
