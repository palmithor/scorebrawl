export type LeaguePlayerUser = {
  userId: string;
  imageUrl: string;
  name: string;
  disabled: boolean;
  joinedAt: Date;
};

export type SeasonPlayerUser = {
  userId: string;
  imageUrl: string;
  name: string;
  elo: number;
  disabled: boolean;
  joinedAt: Date;
};
