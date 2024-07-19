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
  name: string;
  imageUrl: string;
};

export type MatchDepr = {
  id: string;
  seasonId: string;
  homeScore: number;
  awayScore: number;
  homeTeam: MatchPlayer[];
  awayTeam: MatchPlayer[];
  createdAt: Date;
};

export type Match = {
  id: string;
  homeScore: number;
  awayScore: number;
  homeTeamSeasonPlayerIds: string[];
  awayTeamSeasonPlayerIds: string[];
  createdAt: Date;
};
