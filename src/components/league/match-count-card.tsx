import { api } from "~/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export const MatchesPlayedCard = ({ leagueSlug }: { leagueSlug: string }) => {
  const { data } = api.league.getMatchesPlayedStats.useQuery(
    {
      leagueSlug,
    },
    { retry: false }
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Matches played</CardTitle>
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
        <div className="text-2xl font-bold">{data && data.count}</div>
        <p className="text-xs text-muted-foreground">
          {data && `Over ${data.seasonCount} ${data.seasonCount == 1 ? "season" : "seasons"}`}
        </p>
      </CardContent>
    </Card>
  );
};
