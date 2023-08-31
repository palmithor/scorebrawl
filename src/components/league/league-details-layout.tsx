import * as React from "react";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Spinner } from "~/components/spinner";
import { LoadingButton } from "~/components/ui/loading-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useLeague } from "~/hooks/league-details-hook";

export type Tab = "overview" | "seasons" | "statistics" | "feed";

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
  const [isJoining, setIsJoining] = React.useState(false);
  const { isLoading, league, joinLeagueMutate, refetchPlayers, leagueCode, leaguePlayers } =
    useLeague();

  if (isLoading || !league) {
    return (
      <div className="flex h-screen">
        <div className="m-auto">
          <Spinner />
        </div>
      </div>
    );
  }

  const shouldShowJoin =
    !hideJoinButton && leagueCode && !leaguePlayers?.some((u) => u?.userId === userId);

  const joinLeague = () => {
    setIsJoining(true);
    if (leagueCode) {
      joinLeagueMutate(leagueCode, {
        onSuccess: () => {
          void refetchPlayers();
        },
      }).catch(() => setIsJoining(false));
    }
  };

  return (
    <Tabs defaultValue={activeTab} className="space-y-4 p-3">
      <div className="flex flex-grow flex-row flex-wrap gap-4">
        <div className="grow">
          <TabsList>
            <TabsTrigger value="overview">
              <Link href={`/leagues/${encodeURIComponent(league.slug)}`}>Overview</Link>
            </TabsTrigger>
            <TabsTrigger value="seasons">
              <Link href={`/leagues/${encodeURIComponent(league.slug)}/seasons`}>Seasons</Link>
            </TabsTrigger>
            <TabsTrigger value="statistics" disabled>
              Statistics
            </TabsTrigger>
            <TabsTrigger value="feed" disabled>
              Feed
            </TabsTrigger>
          </TabsList>
        </div>
        {shouldShowJoin && (
          <div className="shrink-0">
            <LoadingButton loading={isJoining} onClick={joinLeague}>
              Join League
            </LoadingButton>
          </div>
        )}
      </div>
      <TabsContent value={activeTab} className="space-y-4">
        {children}
      </TabsContent>
    </Tabs>
  );
};
