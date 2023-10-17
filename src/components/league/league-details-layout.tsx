import * as React from "react";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { LoadingButton } from "~/components/ui/loading-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useLeagueSlug } from "~/hooks/useLeagueSlug";
import { api } from "~/lib/api";
import { useLeagueInvalidation } from "~/hooks/useLeagueInvalidation";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";
import Head from "next/head";
import { useRouter } from "next/router";

export type Tab = "overview" | "seasons" | "teams" | "players" | "statistics" | "feed";

export const LeagueDetailsLayout = ({
  activeTab,
  children,
  hideJoinButton,
}: {
  activeTab: Tab;
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
  const { data: teamStanding } = api.season.getTeams.useQuery(
    { seasonId: ongoingSeason?.id as string },
    { enabled: !!ongoingSeason?.id },
  );
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
    <Tabs defaultValue={activeTab} className="space-y-4 p-3">
      <Head>
        <title>Scorebrawl - {league.name}</title>
      </Head>
      <div className="flex flex-grow flex-row flex-wrap items-center gap-4">
        <div className="grow">
          <TabsList>
            <TabsTrigger value="overview">
              <Link href={`/leagues/${encodeURIComponent(league.slug)}`}>Overview</Link>
            </TabsTrigger>
            <TabsTrigger value="seasons">
              <Link href={`/leagues/${encodeURIComponent(league.slug)}/seasons`}>Seasons</Link>
            </TabsTrigger>
            <TabsTrigger value="players">
              <Link href={`/leagues/${encodeURIComponent(league.slug)}/players`}>Players</Link>
            </TabsTrigger>
            {teamStanding && teamStanding.length > 0 && (
              <TabsTrigger value="teams">
                <Link href={`/leagues/${encodeURIComponent(league.slug)}/teams`}>Team Table</Link>
              </TabsTrigger>
            )}
          </TabsList>
        </div>
        {shouldShowJoin && (
          <div className="shrink-0">
            <LoadingButton loading={isJoining} onClick={joinLeague}>
              Join League
            </LoadingButton>
          </div>
        )}
        {!shouldShowJoin && (
          <div className="shrink-0">
            {shouldShowInviteButton && activeTab === "players" && (
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
            {ongoingSeason && activeTab === "overview" && (
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
      <TabsContent value={activeTab} className="space-y-4">
        {children}
      </TabsContent>
    </Tabs>
  );
};
