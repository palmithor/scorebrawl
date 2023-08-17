import { type NextPage } from "next";
import { api } from "~/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { OngoingSeasonCard } from "~/components/league/ongoing-season-card";
import { useAuth } from "@clerk/nextjs";
import { AvatarName } from "~/components/user/avatar-name";
import { LoadingButton } from "~/components/ui/loading-button";
import { LeaguePlayers } from "~/components/league/league-players";

const League: NextPage = () => {
  const router = useRouter();
  const { userId } = useAuth();

  const leagueSlug = router.query.leagueSlug as string;
  const {
    data: league,
    isLoading,
    error,
  } = api.league.getBySlug.useQuery({
    leagueSlug,
  });
  const { data: leaguePlayers } = api.league.getPlayers.useQuery({
    leagueSlug,
  });
  const { data: code } = api.league.getCode.useQuery(
    { leagueSlug },
    { enabled: !!league?.id }
  );

  const { mutate: joinLeagueMutate, isLoading: joinLeagueIsLoading } =
    api.league.join.useMutation();

  const shouldShowJoin =
    !leaguePlayers ||
    (!leaguePlayers?.find((u) => u?.userId === userId) && code);

  useEffect(() => {
    if (error) {
      router.push("/leagues").catch(console.error);
    }
  }, [router, error]);

  if (isLoading) {
    return <p>loading</p>;
  }

  const joinLeague = () => {
    if (code) {
      joinLeagueMutate(code);
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
      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                King of the League
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-4 w-4 text-muted-foreground"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                />
              </svg>
            </CardHeader>
            <CardContent>
              <AvatarName name="John Deere">
                <p className="text-xs text-muted-foreground">0 matches won</p>
              </AvatarName>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In form</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-4 w-4 text-muted-foreground"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z"
                />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="flex items-center ">
                <AvatarName name="John Deere">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  </div>
                </AvatarName>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Matches played
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-4 w-4 text-muted-foreground"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5"
                />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Over 0 seasons</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Latest match
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </CardHeader>
            <CardContent></CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <OngoingSeasonCard className="col-span-4" leagueSlug={leagueSlug} />
          <LeaguePlayers className="col-span-3" leagueSlug={leagueSlug} />
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default League;
