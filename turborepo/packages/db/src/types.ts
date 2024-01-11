import { type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { leagues, seasons } from "./schema";

export type League = InferSelectModel<typeof leagues>;
export type Season = InferSelectModel<typeof seasons>;
export type NewSeason = InferInsertModel<typeof seasons>;

export type LeagueEventData = PlayerJoinedEventData | SeasonCreatedEventData;

export type PlayerJoinedEventData = {
  leaguePlayerId: string;
};

export type SeasonCreatedEventData = {
  seasonId: string;
};
