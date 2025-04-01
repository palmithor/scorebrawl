"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { useSeason } from "@/context/season-context";
import { api } from "@/trpc/react";
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useEffect } from "react";
import { useFixturesRounds } from "../components/Fixtures";
import { findCurrentRound } from "../components/utils/fixtureUtils";

const SeasonFixturesPage = () => {
  const [seasonPlayerIds, setSeasonPlayerIds] = useQueryState(
    "seasonPlayerId",
    parseAsArrayOf(parseAsString),
  );
  const [round, setRound] = useQueryState("round", parseAsInteger);

  const { leagueSlug, seasonSlug } = useSeason();
  const { data: season, isLoading: isLoadingSeason } = api.season.getBySlug.useQuery({
    leagueSlug,
    seasonSlug,
  });
  const { data } = useFixturesRounds();
  useEffect(() => {
    if (data && !round) {
      const { currentRoundIndex } = findCurrentRound({ rounds: data });
      if (currentRoundIndex > 0) {
        setRound(currentRoundIndex);
      }
    }
  }, [data, setRound, round]);

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

  console.log(data);
  console.log(seasonPlayerIds);
  console.log(round);

  return <p>fixtures</p>;
};

export default SeasonFixturesPage;
