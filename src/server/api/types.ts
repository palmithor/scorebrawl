export type LeaguePlayerUser = {
  id: string;
  userId: string;
  imageUrl: string;
  name: string;
  disabled: boolean;
  joinedAt: Date;
};

export type SeasonPlayerUser = {
  id: string;
  userId: string;
  imageUrl: string;
  name: string;
  elo: number;
  disabled: boolean;
  joinedAt: Date;
};

export type MatchInfo = {
  id: string;
  seasonId: string;
  homeScore: number;
  awayScore: number;
  homeExpectedElo: number;
  awayExpectedElo: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  matchPlayers: {
    homeTeam: boolean;
    seasonPlayer: {
      id: string;
      seasonId: string;
      leaguePlayerId: string;
      elo: number;
      disabled: boolean;
      createdAt: Date;
      updatedAt: Date;
      leaguePlayer: { userId: string };
    };
  }[];
  season: { id: string; name: string };
};

export type PlayerForm = ("W" | "D" | "L")[];
