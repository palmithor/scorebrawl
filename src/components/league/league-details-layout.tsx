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
}: {
  activeTab: Tab;
  children: React.ReactNode;
}) => {
  const { userId } = useAuth();
  const {
    isLoading,
    league,
    leaguePlayers,
    joinLeagueMutate,
    joinLeagueIsLoading,
    refetchPlayers,
    leagueCode,
  } = useLeague();

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
    !leaguePlayers ||
    (!leaguePlayers?.find((u) => u?.userId === userId) && leagueCode);

  const joinLeague = () => {
    if (leagueCode) {
      joinLeagueMutate(leagueCode, {
        onSuccess: () => {
          void refetchPlayers();
        },
      });
    }
  };

  return (
    <Tabs defaultValue={activeTab} className="space-y-4 p-3">
      <div className="flex flex-grow">
        <div className="grow">
          <TabsList>
            <TabsTrigger value="overview">
              {" "}
              <Link href={`/leagues/${encodeURIComponent(league.slug)}`}>
                Overview
              </Link>
            </TabsTrigger>
            <TabsTrigger value="seasons">
              <Link
                href={`/leagues/${encodeURIComponent(league.slug)}/seasons`}
              >
                Seasons
              </Link>
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
          <LoadingButton loading={joinLeagueIsLoading} onClick={joinLeague}>
            Join League
          </LoadingButton>
        )}
      </div>
      <TabsContent value={activeTab} className="space-y-4">
        {children}
      </TabsContent>
    </Tabs>
  );
};
