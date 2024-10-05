import type { InferSelectModel } from "drizzle-orm";
import type { LeagueInvites, Seasons, leagueMemberRoles } from "./schema";

export type LeagueMemberRole = (typeof leagueMemberRoles)[number];
export type Season = InferSelectModel<typeof Seasons>;
export type Invite = InferSelectModel<typeof LeagueInvites>;

export type LeagueEventData = PlayerJoinedEventData | SeasonCreatedEventData;

export type PlayerJoinedEventData = {
  leaguePlayerId: string;
};

export type SeasonCreatedEventData = {
  seasonId: string;
};
