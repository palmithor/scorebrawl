import { type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { type leagues, type seasonPlayers, type seasons } from "~/server/db/schema";
import { type LibSQLDatabase } from "drizzle-orm/libsql";
import type * as schema from "./schema";

export type LeagueModel = InferSelectModel<typeof leagues>;
export type LeaguePlayer = InferSelectModel<typeof schema.leaguePlayers>;
export type Season = InferSelectModel<typeof seasons>;
export type SeasonPlayer = InferSelectModel<typeof seasonPlayers>;
export type NewSeason = InferInsertModel<typeof seasons>;

export type Db = LibSQLDatabase<typeof schema>;

export type LeagueEventData = PlayerJoinedEventData | SeasonCreatedEventData;

export type PlayerJoinedEventData = {
  leaguePlayerId: string;
};

export type SeasonCreatedEventData = {
  seasonId: string;
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
};
