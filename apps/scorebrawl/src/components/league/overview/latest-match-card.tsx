import { getLatest } from "@/actions/match";
import { Card, CardContent, CardHeader, CardTitle } from "@scorebrawl/ui/card";

import { getById } from "@/actions/season";
import type { Season } from "@scorebrawl/db/types";
import { MonitorPlay } from "lucide-react";
import { LatestMatchCardContent } from "./latest-match-card-content";

export const LatestMatchCard = async ({ leagueId }: { leagueId: string }) => {
  const match = await getLatest(leagueId);
  let season: Season | undefined;
  if (match) {
    season = await getById(match.seasonId, leagueId);
  }
  // TODO check is league player
  const isLeaguePlayer = true;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
        <CardTitle className="text-sm font-medium">Latest Match</CardTitle>
        <MonitorPlay className="h-6 w-6" />
      </CardHeader>
      <CardContent>
        {match ? (
          <>
            {season && <p className="text-xs text-muted-foreground mb-4">Season {season?.name}</p>}
            <LatestMatchCardContent match={match} isLeaguePlayer={isLeaguePlayer} />
          </>
        ) : (
          <div>no match</div>
        )}
      </CardContent>
    </Card>
  );
};
