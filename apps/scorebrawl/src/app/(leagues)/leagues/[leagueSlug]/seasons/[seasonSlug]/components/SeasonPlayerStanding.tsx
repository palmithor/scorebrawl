"use client";
import { Standing } from "@/components/standing/standing";
import { EmptyCardContentText } from "@/components/state/empty-card-content";
import { Skeleton } from "@/components/ui/skeleton";
import { useSeason } from "@/context/season-context";
import { api } from "@/trpc/react";

export const SeasonPlayerStanding = () => {
  const { leagueSlug, seasonSlug } = useSeason();
  const { data, isLoading } = api.seasonPlayer.getStanding.useQuery({ leagueSlug, seasonSlug });
  return (
    <>
      {isLoading && <Skeleton className={"w-full h-80"} />}
      {!isLoading && data && data.length > 0 && (
        <Standing
          items={data?.map((sp) => ({
            id: sp.seasonPlayerId,
            name: sp.user.name,
            score: sp.score,
            form: sp.form,
            matchCount: sp.matchCount,
            winCount: sp.winCount,
            drawCount: sp.drawCount,
            lossCount: sp.lossCount,
            pointDiff: sp.pointDiff,
            avatars: [{ id: sp.user.userId, imageUrl: sp.user.imageUrl, name: sp.user.name }],
          }))}
        />
      )}
      {data?.length === 0 && (
        <EmptyCardContentText>No team matches registered</EmptyCardContentText>
      )}
    </>
  );
};
