import type { MatchResultSymbol } from "@scorebrawl/api";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { leagues, seasons } from "./schema";

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
  leaguePlayerId: string;
  userId: string;
  name: string;
  imageUrl: string;
  score: number;
  joinedAt: Date;
  disabled: boolean;
  matchCount: number;
};

export type MatchPlayer = {
  userId: string;
  id: string;
  seasonPlayerId: string;
  leaguePlayerId: string;
  score: number;
  name: string;
  imageUrl: string;
};

export type MatchTeam = {
  score: number;
  result: MatchResultSymbol;
  expectedElo: number;
  players: MatchPlayer[];
};

export type Match = {
  id: string;
  seasonId: string;
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  createdAt: Date;
  createdBy: string;
};
