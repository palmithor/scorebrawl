"use client";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@scorebrawl/ui/card";
import { Skeleton } from "@scorebrawl/ui/skeleton";
import { ListStart } from "lucide-react";

export const LatestMatchCard = ({
  leagueSlug,
  seasonSlug,
}: { leagueSlug: string; seasonSlug: string }) => {
  const { data, isLoading } = api.match.getLatest.useQuery({ seasonSlug, leagueSlug });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-medium">Latest Match</CardTitle>
        <ListStart className="h-6 w-6" />
      </CardHeader>
      <CardContent>
        {isLoading && <Skeleton className={"gap-2 h-14 w-full"} />}
        {!data && !isLoading && <div className={"gap-2 text-sm"}>No matches</div>}
      </CardContent>
    </Card>
  );
};
