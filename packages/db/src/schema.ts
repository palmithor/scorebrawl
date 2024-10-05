import { type NotificationData, leagueAchievementType, notificationType } from "@scorebrawl/model";
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  json,
  pgTable,
  real,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import type { z } from "zod";
import type { LeagueEventData } from "./types";

const defaultVarcharConfig = { length: 100 };
export const cuidConfig = { length: 32 };

export const Leagues = pgTable(
  "league",
  {
    id: varchar("id", cuidConfig).primaryKey(),
    name: varchar("name", defaultVarcharConfig).notNull(),
    slug: varchar("name_slug", defaultVarcharConfig).notNull(),
    logoUrl: varchar("logo_url", defaultVarcharConfig),
    archived: boolean("archived").default(false).notNull(),
    createdBy: varchar("created_by").notNull(),
    updatedBy: varchar("updated_by").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (league) => ({
    slugIdx: uniqueIndex("league_name_slug_uq_idx").on(league.slug),
  }),
);

const leagueEventType = [
  "mgit staatch_created_v1",
  "player_joined_v1",
  "season_created_v1",
  "match_undo_v1",
] as const;

export const LeagueEvents = pgTable("league_event", {
  id: varchar("id", cuidConfig).primaryKey(),
  leagueId: varchar("league_id", cuidConfig)
    .notNull()
    .references(() => Leagues.id),
  type: varchar("type", {
    enum: leagueEventType,
  }).notNull(),
  data: json("data").$type<LeagueEventData>(),
  createdBy: varchar("created_by", defaultVarcharConfig).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const LeaguePlayers = pgTable(
  "league_player",
  {
    id: varchar("id", cuidConfig).primaryKey(),
    userId: varchar("user_id", defaultVarcharConfig)
      .notNull()
      .references(() => Users.id),
    leagueId: varchar("league_id", cuidConfig)
      .notNull()
      .references(() => Leagues.id),
    disabled: boolean("disabled").default(false).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (player) => ({
    leaguePlayerIdx: uniqueIndex("league_player_uq_idx").on(player.leagueId, player.userId),
  }),
);

export const LeagueTeams = pgTable("league_team", {
  id: varchar("id", cuidConfig).primaryKey(),
  name: varchar("name", defaultVarcharConfig).notNull(),
  leagueId: varchar("league_id", cuidConfig)
    .notNull()
    .references(() => Leagues.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const LeagueTeamPlayers = pgTable(
  "league_team_player",
  {
    id: varchar("id", cuidConfig).primaryKey(),
    leaguePlayerId: varchar("league_player_id", cuidConfig)
      .notNull()
      .references(() => LeaguePlayers.id),
    teamId: varchar("team_id", cuidConfig)
      .notNull()
      .references(() => LeagueTeams.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (leagueTeamPlayer) => ({
    leagueTeamPlayerIdx: uniqueIndex("league_team_player_uq_idx").on(
      leagueTeamPlayer.teamId,
      leagueTeamPlayer.leaguePlayerId,
    ),
  }),
);

export const leagueMemberRoles = ["viewer", "member", "editor", "owner"] as const;

export const LeagueMembers = pgTable(
  "league_member",
  {
    id: varchar("id", cuidConfig).primaryKey(),
    userId: varchar("user_id", defaultVarcharConfig).notNull(),
    leagueId: varchar("league_id", cuidConfig)
      .notNull()
      .references(() => Leagues.id),
    role: varchar("role", {
      enum: leagueMemberRoles,
    }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (player) => ({
    leaguePlayerIdx: uniqueIndex("league_member_uq_idx").on(player.leagueId, player.userId),
  }),
);

const scoreType = ["elo", "3-1-0", "elo-individual-vs-team"] as const;

export const Seasons = pgTable(
  "season",
  {
    id: varchar("id", cuidConfig).primaryKey(),
    name: varchar("name", defaultVarcharConfig).notNull(),
    slug: varchar("name_slug", defaultVarcharConfig).notNull(),
    initialScore: integer("initial_score").notNull(),
    scoreType: varchar("score_type", { enum: scoreType }).notNull(),
    kFactor: integer("k_factor").notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"),
    leagueId: varchar("league_id", cuidConfig)
      .notNull()
      .references(() => Leagues.id),
    createdBy: varchar("created_by").notNull(),
    updatedBy: varchar("updated_by").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (season) => ({
    slugIdx: uniqueIndex("season_name_slug_uq_idx").on(season.slug),
  }),
);

export const SeasonTeams = pgTable(
  "season_team",
  {
    id: varchar("id", cuidConfig).primaryKey(),
    seasonId: varchar("season_id", cuidConfig)
      .notNull()
      .references(() => Seasons.id),
    teamId: varchar("team_id", cuidConfig)
      .notNull()
      .references(() => LeagueTeams.id),
    score: integer("score").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (seasonTeam) => ({
    seasonTeamIdx: uniqueIndex("season_team_uq_idx").on(seasonTeam.seasonId, seasonTeam.teamId),
    seasonIdIdx: index("season_team_season_id_idx").on(seasonTeam.seasonId),
  }),
);

const matchResult = ["W", "L", "D"] as const;

export const MatchTeams = pgTable(
  "season_team_match",
  {
    id: varchar("id", cuidConfig).primaryKey(),
    seasonTeamId: varchar("season_team_id", cuidConfig)
      .notNull()
      .references(() => SeasonTeams.id),
    matchId: varchar("match_id", cuidConfig)
      .notNull()
      .references(() => Matches.id),
    scoreBefore: integer("score_before").notNull().default(-1),
    scoreAfter: integer("score_after").notNull().default(-1),
    result: varchar("result", { enum: matchResult }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (teamMatch) => ({
    seasonTeamIdIdx: index("team_matches_season_team_id_idx").on(teamMatch.seasonTeamId),
    matchIdIdx: index("team_matches_match_id_idx").on(teamMatch.matchId),
    createdAtIdx: index("team_matches_created_at_idx").on(teamMatch.createdAt),
  }),
);

export const SeasonPlayers = pgTable(
  "season_player",
  {
    id: varchar("id", cuidConfig).primaryKey(),
    seasonId: varchar("season_id", cuidConfig)
      .notNull()
      .references(() => Seasons.id),
    leaguePlayerId: varchar("league_player_id", cuidConfig)
      .notNull()
      .references(() => LeaguePlayers.id),
    score: integer("score").notNull(),
    disabled: boolean("disabled").default(false).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (season) => ({
    seasonPlayerIdx: uniqueIndex("season_player_uq_idx").on(season.seasonId, season.leaguePlayerId),
    seasonIdIdx: index("season_player_season_id_idx").on(season.seasonId),
  }),
);

export const Matches = pgTable(
  "match",
  {
    id: varchar("id", cuidConfig).primaryKey(),
    seasonId: varchar("season_id", cuidConfig)
      .notNull()
      .references(() => Seasons.id),
    homeScore: integer("home_score").notNull(),
    awayScore: integer("away_score").notNull(),
    homeExpectedElo: real("home_expected_elo"),
    awayExpectedElo: real("away_expected_elo"),
    createdBy: varchar("created_by").notNull(),
    updatedBy: varchar("updated_by").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (match) => ({
    matchCreatedAtIdx: index("match_created_at_idx").on(match.createdAt),
  }),
);

export const MatchPlayers = pgTable(
  "match_player",
  {
    id: varchar("id", cuidConfig).primaryKey(),
    seasonPlayerId: varchar("season_player_id", cuidConfig)
      .notNull()
      .references(() => SeasonPlayers.id),
    homeTeam: boolean("home_team").notNull(),
    matchId: varchar("match_id", cuidConfig)
      .notNull()
      .references(() => Matches.id),
    scoreBefore: integer("score_before").notNull().default(-1),
    scoreAfter: integer("score_after").notNull().default(-1),
    result: varchar("result", { enum: matchResult }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (matchPlayer) => ({
    seasonPlayerIdx: index("match_player_season_player_id_idx").on(matchPlayer.seasonPlayerId),
    matchIdIdx: index("match_player_match_id_idx").on(matchPlayer.matchId),
  }),
);

export const LeagueInvites = pgTable(
  "league_invite",
  {
    id: varchar("id", cuidConfig).primaryKey(),
    leagueId: varchar("league_id")
      .references(() => Leagues.id)
      .notNull(),
    role: varchar("role", { enum: leagueMemberRoles }).notNull(),
    code: varchar("code", cuidConfig).notNull(),
    expiresAt: timestamp("expires_at"),
    createdBy: varchar("created_by").notNull(),
    updatedBy: varchar("updated_by").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (invite) => ({
    codeIdx: uniqueIndex("league_invite_code_uq_idx").on(invite.code),
  }),
);

export const Users = pgTable("user", {
  id: varchar("id", { length: 100 }).primaryKey(),
  imageUrl: varchar("image_url", { length: 255 }).notNull(),
  name: varchar("name").notNull(),
  defaultLeagueId: varchar("default_league_id", cuidConfig).references(() => Leagues.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const Notifications = pgTable("notification", {
  id: varchar("id", cuidConfig).primaryKey(),
  userId: varchar("user_id", cuidConfig)
    .notNull()
    .references(() => Users.id),
  type: varchar("type", { enum: notificationType }).notNull(),
  data: json("data").$type<z.output<typeof NotificationData>>().notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const LeaguePlayerAchievement = pgTable(
  "league_player_achievement",
  {
    id: varchar("id", cuidConfig).primaryKey(),
    leaguePlayerId: varchar("league_player_id", cuidConfig)
      .notNull()
      .references(() => LeaguePlayers.id),
    type: varchar("type_id", { enum: leagueAchievementType }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (achievement) => ({
    leagueAchievementIdx: uniqueIndex("league_player_achievement_uq_idx").on(
      achievement.leaguePlayerId,
      achievement.type,
    ),
  }),
);

export const leaguesRelations = relations(Leagues, ({ many }) => ({
  seasons: many(Seasons),
  invites: many(LeagueInvites),
  leaguePlayers: many(LeaguePlayers),
  leagueTeams: many(LeagueTeams),
  members: many(LeagueMembers),
  events: many(LeagueEvents),
}));

export const leagueInvitesRelations = relations(LeagueInvites, ({ one }) => ({
  league: one(Leagues, {
    fields: [LeagueInvites.leagueId],
    references: [Leagues.id],
  }),
}));

export const seasonTeamRelations = relations(SeasonTeams, ({ one, many }) => ({
  leagueTeam: one(LeagueTeams, {
    fields: [SeasonTeams.teamId],
    references: [LeagueTeams.id],
  }),
  season: one(Seasons, {
    fields: [SeasonTeams.seasonId],
    references: [Seasons.id],
  }),
  matches: many(MatchTeams),
}));

export const userRelations = relations(Users, ({ many }) => ({
  leaguePlayers: many(LeaguePlayers),
}));

export const leaguePlayerRelations = relations(LeaguePlayers, ({ one, many }) => ({
  user: one(Users, {
    fields: [LeaguePlayers.userId],
    references: [Users.id],
  }),
  league: one(Leagues, {
    fields: [LeaguePlayers.leagueId],
    references: [Leagues.id],
  }),
  teamPlayer: many(LeagueTeamPlayers),
  seasonPlayers: many(SeasonPlayers),
}));

export const leagueTeamRelations = relations(LeagueTeams, ({ one, many }) => ({
  league: one(Leagues, {
    fields: [LeagueTeams.leagueId],
    references: [Leagues.id],
  }),
  players: many(LeagueTeamPlayers),
}));

export const leagueTeamPlayerRelations = relations(LeagueTeamPlayers, ({ one }) => ({
  team: one(LeagueTeams, {
    fields: [LeagueTeamPlayers.teamId],
    references: [LeagueTeams.id],
  }),
  leaguePlayer: one(LeaguePlayers, {
    fields: [LeagueTeamPlayers.leaguePlayerId],
    references: [LeaguePlayers.id],
  }),
}));

export const leagueMemberRelations = relations(LeagueMembers, ({ one }) => ({
  league: one(Leagues, {
    fields: [LeagueMembers.leagueId],
    references: [Leagues.id],
  }),
}));

export const seasonRelations = relations(Seasons, ({ one, many }) => ({
  seasonPlayers: many(SeasonPlayers),
  matches: many(Matches),
  seasonTeams: many(SeasonTeams),
  league: one(Leagues, {
    fields: [Seasons.leagueId],
    references: [Leagues.id],
  }),
}));

export const leagueEventRelations = relations(LeagueEvents, ({ one }) => ({
  league: one(Leagues, {
    fields: [LeagueEvents.leagueId],
    references: [Leagues.id],
  }),
}));

export const seasonPlayerRelations = relations(SeasonPlayers, ({ one, many }) => ({
  season: one(Seasons, {
    fields: [SeasonPlayers.seasonId],
    references: [Seasons.id],
  }),
  leaguePlayer: one(LeaguePlayers, {
    fields: [SeasonPlayers.leaguePlayerId],
    references: [LeaguePlayers.id],
  }),
  matches: many(MatchPlayers),
}));

export const seasonTeamMatchRelations = relations(MatchTeams, ({ one }) => ({
  match: one(Matches, {
    fields: [MatchTeams.matchId],
    references: [Matches.id],
  }),
  seasonTeam: one(SeasonTeams, {
    fields: [MatchTeams.seasonTeamId],
    references: [SeasonTeams.id],
  }),
}));

export const matchRelations = relations(Matches, ({ one, many }) => ({
  matchPlayers: many(MatchPlayers),
  season: one(Seasons, {
    fields: [Matches.seasonId],
    references: [Seasons.id],
  }),
  teamMatches: many(MatchTeams),
}));

export const matchPlayerRelations = relations(MatchPlayers, ({ one }) => ({
  match: one(Matches, {
    fields: [MatchPlayers.matchId],
    references: [Matches.id],
  }),
  seasonPlayer: one(SeasonPlayers, {
    fields: [MatchPlayers.seasonPlayerId],
    references: [SeasonPlayers.id],
  }),
}));
