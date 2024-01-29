"use client";

import { AvatarProps, MultiAvatar } from "@scorebrawl/ui/multi-avatar";
import { Skeleton } from "@scorebrawl/ui/skeleton";
import React from "react";
import useSWR, { Fetcher } from "swr";

const fetcher: Fetcher<AvatarProps[], string> = async (path: string) => {
  const res = await fetch(path);
  return await res.json();
};

export const LeaguePlayerMultiAvatar = ({ leagueSlug }: { leagueSlug: string }) => {
  const { data } = useSWR(`/api/leagues/${leagueSlug}/players`, fetcher);

  if (!data) {
    return (
      <div className="flex -space-x-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    );
  }

  return <MultiAvatar users={data} visibleCount={4} />;
};
