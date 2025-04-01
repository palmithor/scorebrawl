"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { useSeason } from "@/context/season-context";
import { api } from "@/trpc/react";
import type { SeasonPlayerDTO } from "@scorebrawl/api";
import type { z } from "zod";
import { type Fixture, FixtureButton } from "./FixtureButton";
import { MatchFixturesFilter } from "./FixtureFilters";

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

  const { data: players, isLoading } = api.seasonPlayer.getAll.useQuery({
    leagueSlug,
    seasonSlug,
  });

  const usersMap = players?.reduce<{ [id: string]: z.output<typeof SeasonPlayerDTO> }>(
    (acc, player) => {
      acc[player.seasonPlayerId] = player;
      return acc;
    },
    {},
  );

  function transformData() {
    const roundsMap: Record<string, FixtureRound> = {};

    if (fixtures) {
      for (const fixture of fixtures) {
        const roundId = fixture.round.toString();

        if (!roundsMap[roundId]) {
          roundsMap[roundId] = {
            id: roundId,
            name: `Round ${fixture.round}`,
            fixtures: [],
          };
        }
        const player1 = fixture.homePlayerId && usersMap?.[fixture.homePlayerId];
        const player2 = fixture.awayPlayerId && usersMap?.[fixture.awayPlayerId];
        if (player1 && player2) {
          roundsMap[roundId]?.fixtures.push({
            id: fixture.id,
            matchId: fixture.matchId,
            player1,
            player2,
          });
        }
      }
    }
    return Object.values(roundsMap);
  }
  return { data: transformData(), isLoading: isLoading || isLoadingFixtures };
};

export const Fixtures = () => {
  const { leagueSlug, seasonSlug } = useSeason();

  // const [showNext, setShowNext] = useState(false);
  const { data: rounds, isLoading } = useFixturesRounds();

  if (isLoading || isLoadingPlayers) {
    return <Skeleton className="w-full h-80" />;
  }
  // const roundIndex = rounds.findIndex((round) => round.fixtures.some((f) => !f.matchId));
  // const currentRound = rounds[roundIndex];
  // const firstRound = rounds[0];
  // const lastRound = rounds[rounds.length - 1];
  // const roundsToShow = currentRound
  //   ? [
  //       ...(showPrev ? rounds.slice(0, roundIndex) : []),
  //       currentRound,
  //       ...(showNext ? rounds.slice(roundIndex + 1) : []),
  //     ]
  //   : rounds;

  return (
    <div className="flex w-full flex-col gap-2">
      {/* {firstRound && roundsToShow.indexOf(firstRound) === -1 && (
        <Button
          size="sm"
          variant="ghost"
          className="text-muted-foreground"
          onClick={() => setShowPrev(true)}
        >
          Show previous rounds
        </Button>
      )} */}
      <MatchFixturesFilter players={} />
      <div className="space-y-8">
        {rounds.map((round) => (
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
        ))}
      </div>
      {/* {lastRound && roundsToShow.indexOf(lastRound) === -1 && (
        <Button
          size="sm"
          variant="ghost"
          className="text-muted-foreground"
          onClick={() => setShowNext(true)}
        >
          Show upcoming rounds
        </Button> */}
      {/* )} */}
    </div>
  );
};
