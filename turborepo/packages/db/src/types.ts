import { type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { leagues, seasons } from "./schema";

export type League = InferSelectModel<typeof leagues>;
export type LeagueOmitCode = Omit<League, "code">;
export type Season = InferSelectModel<typeof seasons>;
export type SeasonInsertModel = InferInsertModel<typeof seasons>;

export type LeagueEventData = PlayerJoinedEventData | SeasonCreatedEventData;

export type PlayerJoinedEventData = {
  leaguePlayerId: string;
};

export type SeasonCreatedEventData = {
  seasonId: string;
};

export type SeasonPlayer = {
  id: string;
  userId: string;
  name: string;
  imageUrl: string;
  elo: number;
  joinedAt: Date;
  disabled: boolean;
  matchCount: number;
};
