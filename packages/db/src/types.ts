import type { MatchResultSymbol } from "@scorebrawl/api";
import type { InferSelectModel } from "drizzle-orm";
import type { leagueInvites, leagueMemberRoles, leagues, seasons } from "./schema";

export type LeagueMemberRole = (typeof leagueMemberRoles)[number];
export type League = InferSelectModel<typeof leagues>;
export type LeagueOmitCode = Omit<League, "code">;
export type Season = InferSelectModel<typeof seasons>;
export type Invite = InferSelectModel<typeof leagueInvites>;
export type LeagueMember = {
  memberId: string;
  role: LeagueMemberRole;
  userId: string;
  name: string;
  imageUrl: string;
};

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
