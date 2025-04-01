"use client";
import type { useFixturesRounds } from "../Fixtures";
export const findCurrentRound = ({
  rounds,
}: { rounds: ReturnType<typeof useFixturesRounds>["data"] }) => {
  const currentRoundIndex = rounds.findIndex((round) => round.fixtures.some((f) => !f.matchId));
  const currentRound = rounds[currentRoundIndex];
  return { currentRoundIndex, currentRound };
};
