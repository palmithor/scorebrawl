export interface EloRank {
  title: string;
  short: string;
}

/**
 * Get the rank tier from ELO score
 * @param elo - The ELO score
 * @returns The rank tier object with title and short
 */
export function getRankFromElo(elo: number): EloRank {
  if (elo >= 2000) return { title: "Champion", short: "C" };
  if (elo >= 1800) return { title: "Diamond III", short: "D3" };
  if (elo >= 1600) return { title: "Diamond II", short: "D2" };
  if (elo >= 1400) return { title: "Diamond I", short: "D1" };
  if (elo >= 1200) return { title: "Platinum III", short: "P3" };
  if (elo >= 1000) return { title: "Platinum II", short: "P2" };
  if (elo >= 800) return { title: "Platinum I", short: "P1" };
  if (elo >= 600) return { title: "Gold III", short: "G3" };
  if (elo >= 400) return { title: "Gold II", short: "G2" };
  if (elo >= 200) return { title: "Gold I", short: "G1" };
  return { title: "Bronze", short: "B" };
}
