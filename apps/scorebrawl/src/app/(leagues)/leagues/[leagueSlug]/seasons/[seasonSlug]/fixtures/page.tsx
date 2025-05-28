"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { useSeason } from "@/context/season-context";
import { api } from "@/trpc/react";
import { Fixtures } from "../components/fixtures/Fixtures";

const SeasonFixturesPage = () => {
  const { leagueSlug, seasonSlug } = useSeason();
  const { data: season, isLoading: isLoadingSeason } = api.season.getBySlug.useQuery({
    leagueSlug,
    seasonSlug,
  });

  if (isLoadingSeason || !season) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (season.scoreType !== "3-1-0") {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-xl font-semibold text-slate-500">
          Fixtures are not available for this season
        </p>
      </div>
    );
  }

  return <Fixtures />;
};

export default SeasonFixturesPage;
