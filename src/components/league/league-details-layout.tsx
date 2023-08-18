import { useAuth } from "@clerk/nextjs";
import { Spinner } from "~/components/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { LoadingButton } from "~/components/ui/loading-button";
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
    leaguePlayers,
    joinLeagueMutate,
    joinLeagueIsLoading,
    refetchPlayers,
    leagueCode,
  } = useLeague();

  if (isLoading) {
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
    <Tabs defaultValue="overview" className="space-y-4 p-3">
      <div className="flex flex-grow">
        <div className="grow">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="seasons" disabled>
              Seasons
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
