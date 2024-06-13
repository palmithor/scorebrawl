import { getStats } from "@/actions/league";
import { Card, CardContent, CardHeader, CardTitle } from "@scorebrawl/ui/card";

import { BarChart3 } from "lucide-react";

const CountText = ({ count, entity }: { count: number; entity: string }) => (
  <p className="text-xs font-medium text-gray-800 dark:text-white">
    <span className="font-bold">{count}</span> {entity}
  </p>
);

export const LeagueStatsCard = async ({ leagueId }: { leagueId: string }) => {
  const { seasonCount, matchCount, playerCount, teamCount } = await getStats(leagueId);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Statistics</CardTitle>
        <BarChart3 className="h-6 w-6" />
      </CardHeader>
      <CardContent className="grid grid-cols-2">
        <CountText count={seasonCount} entity="Seasons" />
        <CountText count={matchCount} entity="Matches" />
        <CountText count={playerCount} entity="Players" />
        <CountText count={teamCount} entity="Teams" />
      </CardContent>
    </Card>
  );
};
