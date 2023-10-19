import * as React from "react";

import { useAuth } from "@clerk/nextjs";
import { LoadingButton } from "~/components/ui/loading-button";
import { useLeagueSlug } from "~/hooks/useLeagueSlug";
import { api } from "~/lib/api";
import { useLeagueInvalidation } from "~/hooks/useLeagueInvalidation";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";
import Head from "next/head";
import { useRouter } from "next/router";
import { LeagueNav } from "~/components/league/league-nav";
import { useLeagueNav } from "~/hooks/useLeagueNav";

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
  const [isJoining, setIsJoining] = React.useState(false);
  const leagueSlug = useLeagueSlug();
  const invalidate = useLeagueInvalidation();
  const { data: league } = api.league.getBySlug.useQuery({ leagueSlug });
  const { mutateAsync: joinLeagueMutate } = api.league.join.useMutation();
  const { data: leaguePlayers } = api.league.getPlayers.useQuery({ leagueSlug });
  const { data: ongoingSeason } = api.season.getOngoing.useQuery({ leagueSlug }, { retry: false });
  const { isActive } = useLeagueNav();
  const { data: seasonPlayers } = api.season.getPlayers.useQuery(
    { seasonId: ongoingSeason?.id as string },
    { enabled: !!ongoingSeason },
  );
  const hasLessThanTwoPlayers = seasonPlayers && seasonPlayers.length < 2;
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

  return (
    <div>
      <Head>
        <title>Scorebrawl - {league.name}</title>
      </Head>
      <LeagueNav />
      <div className="flex flex-grow flex-row flex-wrap gap-4 pb-2 pt-2">
        {shouldShowJoin && (
          <div className="shrink-0 ">
            <LoadingButton loading={isJoining} onClick={joinLeague}>
              Join League
            </LoadingButton>
          </div>
        )}
        {!shouldShowJoin && (
          <div className="shrink-0">
            {shouldShowInviteButton && isActive("players") && (
              <Button
                size="sm"
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
                Invite link
              </Button>
            )}
            {ongoingSeason && isActive("overview") && (
              <Button
                size="sm"
                disabled={hasLessThanTwoPlayers}
                onClick={() =>
                  void router.push(
                    `/leagues/${leagueSlug}/seasons/${ongoingSeason.id}/matches/create`,
                  )
                }
              >
                Add Match
              </Button>
            )}
          </div>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
};
