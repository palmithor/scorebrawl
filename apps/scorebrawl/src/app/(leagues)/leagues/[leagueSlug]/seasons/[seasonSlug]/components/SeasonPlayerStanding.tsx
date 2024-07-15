"use client";
import { Standing } from "@/components/standing/standing";
import { api } from "@/trpc/react";
import { Skeleton } from "@scorebrawl/ui/skeleton";

export const SeasonPlayerStanding = ({
  leagueSlug,
  seasonSlug,
}: { leagueSlug: string; seasonSlug: string }) => {
  const { data, isLoading } = api.seasonPlayer.getStanding.useQuery({ leagueSlug, seasonSlug });
  return (
    <>
      {isLoading && <Skeleton className={"w-full"} />}
      {!isLoading && data && (
        <Standing
          items={data?.map((sp) => ({
            id: sp.seasonPlayerId,
            name: sp.name,
            score: sp.score,
            form: sp.form,
            matchCount: sp.matchCount,
            winCount: sp.winCount,
            drawCount: sp.drawCount,
            lossCount: sp.lossCount,
            pointDiff: sp.pointDiff,
            avatars: [{ id: sp.seasonPlayerId, imageUrl: sp.imageUrl, name: sp.name }],
          }))}
        />
      )}
    </>
  );
};
