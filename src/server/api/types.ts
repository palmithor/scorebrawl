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
