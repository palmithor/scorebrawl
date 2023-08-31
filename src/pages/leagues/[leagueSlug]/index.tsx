import { type NextPage } from "next";
import { useRouter } from "next/router";
import { InFormCard } from "~/components/league/in-form-card";
import { LeagueDetailsLayout } from "~/components/league/league-details-layout";
import { LeaguePlayers } from "~/components/league/league-players";
import { MatchesPlayedCard } from "~/components/league/match-count-card";
import { OngoingSeasonCard } from "~/components/league/ongoing-season-card";
import { MatchCard } from "~/components/match/match-card";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { AvatarName } from "~/components/user/avatar-name";
import { api } from "~/lib/api";

const LeagueDetails: NextPage = () => {
  const router = useRouter();
  const leagueSlug = router.query.leagueSlug as string;
  const { data: latestMatch } = api.match.getLatest.useQuery({ leagueSlug });

  return (
    <LeagueDetailsLayout activeTab={"overview"}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">King of the League</CardTitle>
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
        <InFormCard leagueSlug={leagueSlug} />
        <MatchesPlayedCard leagueSlug={leagueSlug} />
        <MatchCard
          match={latestMatch}
          title="Latest match"
          matchNotFoundMessage="No matches played"
          icon={
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
          }
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <OngoingSeasonCard className="col-span-4" />
        <LeaguePlayers leagueSlug={leagueSlug} className="col-span-3" />
      </div>
    </LeagueDetailsLayout>
  );
};

export default LeagueDetails;
