"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { useSeason } from "@/context/season-context";
import { api } from "@/trpc/react";
import type { SeasonPlayerDTO } from "@scorebrawl/api";
import type { z } from "zod";
import { type Fixture, FixtureButton } from "./FixtureButton";
import { MatchFixturesFilter, useFixtureFilters } from "./FixtureFilters";

export type FixtureRound = {
  id: string;
  name: string;
  fixtures: Fixture[];
};
export const useFixturesRounds = () => {
  const { leagueSlug, seasonSlug } = useSeason();
  const { data: fixtures, isLoading: isLoadingFixtures } = api.season.getFixtures.useQuery({
    leagueSlug,
    seasonSlug,
  });
  const { data: players, isLoading } = api.seasonPlayer.getAll.useQuery({ leagueSlug, seasonSlug });

  const usersMap = players?.reduce(
    (acc, player) => {
      acc[player.seasonPlayerId] = player;
      return acc;
    },
    {} as Record<string, z.output<typeof SeasonPlayerDTO>>,
  );

  const {
    players: filteredPlayers,
    status: filterStatus,
    rounds: filteredRounds,
  } = useFixtureFilters();

  const transformData = () => {
    if (!fixtures) return [];

    return fixtures.reduce<Record<string, FixtureRound>>((acc, fixture) => {
      const roundId = fixture.round.toString();
      acc[roundId] ??= { id: roundId, name: `Round ${fixture.round}`, fixtures: [] };

      if (
        (filteredRounds.length && !filteredRounds.includes(fixture.round)) ||
        (filteredPlayers.length &&
          !filteredPlayers.includes(fixture.homePlayerId ?? "") &&
          !filteredPlayers.includes(fixture.awayPlayerId ?? "")) ||
        (filterStatus === "completed" && !fixture.matchId) ||
        (filterStatus === "upcoming" && fixture.matchId)
      ) {
        return acc;
      }

      const player1 = usersMap?.[fixture.homePlayerId ?? ""];
      const player2 = usersMap?.[fixture.awayPlayerId ?? ""];

      if (player1 && player2) {
        acc[roundId].fixtures.push({ id: fixture.id, matchId: fixture.matchId, player1, player2 });
      }

      return acc;
    }, {});
  };

  return { data: Object.values(transformData()), isLoading: isLoading || isLoadingFixtures };
};

export const Fixtures = () => {
  const { data: fixtureRounds, isLoading } = useFixturesRounds();

  if (isLoading) {
    return <Skeleton className="w-full h-80" />;
  }
  return (
    <div className="flex w-full flex-col gap-2">
      <MatchFixturesFilter fixtureRounds={fixtureRounds} />
      <div className="space-y-8">
        {fixtureRounds.map((round) => {
          if (!round.fixtures.length) return null;
          return (
            <div key={round.id} className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{round.name}</h3>
                <div className="h-px bg-border" />
              </div>
              <div className="space-y-4">
                {round.fixtures.map((match, i) => (
                  <>
                    <FixtureButton key={match.id} fixture={match} />
                    {i < round.fixtures.length - 1 && <div className="h-px bg-border" />}
                  </>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
