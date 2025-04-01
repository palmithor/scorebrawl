"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { useSeason } from "@/context/season-context";
import Link from "next/link";
import { FixtureButton } from "./FixtureButton";
import { useFixturesRounds } from "./Fixtures";

export const CurrentFixtureCard = () => {
  const { seasonSlug } = useSeason();
  const { data: rounds, isLoading } = useFixturesRounds();

  if (isLoading) {
    return <Skeleton className="w-full h-80" />;
  }
  const roundIndex = rounds.findIndex((round) => round.fixtures.some((f) => !f.matchId));
  const currentRound = rounds[roundIndex];

  if (!currentRound) {
    return (
      <div className="flex w-full flex-col gap-2">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No fixtures available</h3>
              <div className="h-px bg-border" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{currentRound.name}</h3>
            <div className="h-px bg-border" />
          </div>
          <div className="space-y-4">
            {currentRound.fixtures.map((match, i) => (
              <>
                <FixtureButton key={match.id} fixture={match} />
                {i < currentRound.fixtures.length - 1 && <div className="h-px bg-border" />}
              </>
            ))}
          </div>
        </div>
      </div>

      <Link href={`${seasonSlug}/fixtures`}>See all fixtures</Link>
    </div>
  );
};
