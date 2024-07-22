import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  json,
  pgTable,
  real,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import type { LeagueEventData } from "./types";

const defaultVarcharConfig = { length: 100 };
export const cuidConfig = { length: 32 };

export const leagues = pgTable(
  "league",
  {
    id: varchar("id", cuidConfig).primaryKey(),
    name: varchar("name", defaultVarcharConfig).notNull(),
    slug: varchar("name_slug", defaultVarcharConfig).notNull(),
    logoUrl: varchar("logo_url", defaultVarcharConfig),
    code: varchar("code", cuidConfig).notNull(),
    archived: boolean("archived").default(false).notNull(),
    createdBy: varchar("created_by").notNull(),
    updatedBy: varchar("updated_by").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (league) => ({
    slugIdx: uniqueIndex("league_name_slug_uq_idx").on(league.slug),
    codeIdx: uniqueIndex("league_code_uq_idx").on(league.code),
  }),
);

const leagueEventType = [
  "match_created_v1",
  "player_joined_v1",
  "season_created_v1",
  "match_undo_v1",
] as const;

export const leagueEvents = pgTable("league_event", {
  id: varchar("id", cuidConfig).primaryKey(),
  leagueId: varchar("league_id", cuidConfig)
    .notNull()
    .references(() => leagues.id),
  type: varchar("type", {
    enum: leagueEventType,
  }).notNull(),
  data: json("data").$type<LeagueEventData>(),
  createdBy: varchar("created_by", defaultVarcharConfig).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const leaguePlayers = pgTable(
  "league_player",
  {
    id: varchar("id", cuidConfig).primaryKey(),
    userId: varchar("user_id", defaultVarcharConfig)
      .notNull()
      .references(() => users.id),
    leagueId: varchar("league_id", cuidConfig)
      .notNull()
      .references(() => leagues.id),
    disabled: boolean("disabled").default(false).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (player) => ({
    leaguePlayerIdx: uniqueIndex("league_player_uq_idx").on(player.leagueId, player.userId),
  }),
);

export const leagueTeams = pgTable("league_team", {
  id: varchar("id", cuidConfig).primaryKey(),
  name: varchar("name", defaultVarcharConfig).notNull(),
  leagueId: varchar("league_id", cuidConfig)
    .notNull()
    .references(() => leagues.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const leagueTeamPlayers = pgTable(
  "league_team_player",
  {
    id: varchar("id", cuidConfig).primaryKey(),
    leaguePlayerId: varchar("league_player_id", cuidConfig)
      .notNull()
      .references(() => leaguePlayers.id),
    teamId: varchar("team_id", cuidConfig)
      .notNull()
      .references(() => leagueTeams.id),
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

export const leagueMembers = pgTable(
  "league_member",
  {
    id: varchar("id", cuidConfig).primaryKey(),
    userId: varchar("user_id", defaultVarcharConfig).notNull(),
    leagueId: varchar("league_id", cuidConfig)
      .notNull()
      .references(() => leagues.id),
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

export const seasons = pgTable(
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
      .references(() => leagues.id),
    createdBy: varchar("created_by").notNull(),
    updatedBy: varchar("updated_by").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (season) => ({
    slugIdx: uniqueIndex("season_name_slug_uq_idx").on(season.slug),
  }),
);

export const seasonTeams = pgTable(
  "season_team",
  {
    id: varchar("id", cuidConfig).primaryKey(),
    seasonId: varchar("season_id", cuidConfig)
      .notNull()
      .references(() => seasons.id),
    teamId: varchar("team_id", cuidConfig)
      .notNull()
      .references(() => leagueTeams.id),
    score: integer("score").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (seasonTeam) => ({
    seasonTeamIdx: uniqueIndex("season_team_uq_idx").on(seasonTeam.seasonId, seasonTeam.teamId),
  }),
);

const matchResult = ["W", "L", "D"] as const;

export const teamMatches = pgTable("season_team_match", {
  id: varchar("id", cuidConfig).primaryKey(),
  seasonTeamId: varchar("season_team_id", cuidConfig)
    .notNull()
    .references(() => seasonTeams.id),
  matchId: varchar("match_id", cuidConfig)
    .notNull()
    .references(() => matches.id),
  scoreBefore: integer("score_before").notNull().default(-1),
  scoreAfter: integer("score_after").notNull().default(-1),
  result: varchar("result", { enum: matchResult }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const seasonPlayers = pgTable(
  "season_player",
  {
    id: varchar("id", cuidConfig).primaryKey(),
    seasonId: varchar("season_id", cuidConfig)
      .notNull()
      .references(() => seasons.id),
    leaguePlayerId: varchar("league_player_id", cuidConfig)
      .notNull()
      .references(() => leaguePlayers.id),
    score: integer("score").notNull(),
    disabled: boolean("disabled").default(false).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (season) => ({
    seasonPlayerIdx: uniqueIndex("season_player_uq_idx").on(season.seasonId, season.leaguePlayerId),
  }),
);

export const matches = pgTable("match", {
  id: varchar("id", cuidConfig).primaryKey(),
  seasonId: varchar("season_id", cuidConfig)
    .notNull()
    .references(() => seasons.id),
  homeScore: integer("home_score").notNull(),
  awayScore: integer("away_score").notNull(),
  homeExpectedElo: real("home_expected_elo"),
  awayExpectedElo: real("away_expected_elo"),
  createdBy: varchar("created_by").notNull(),
  updatedBy: varchar("updated_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const matchPlayers = pgTable("match_player", {
  id: varchar("id", cuidConfig).primaryKey(),
  seasonPlayerId: varchar("season_player_id", cuidConfig)
    .notNull()
    .references(() => seasonPlayers.id),
  homeTeam: boolean("home_team").notNull(),
  matchId: varchar("match_id", cuidConfig)
    .notNull()
    .references(() => matches.id),
  scoreBefore: integer("score_before").notNull().default(-1),
  scoreAfter: integer("score_after").notNull().default(-1),
  result: varchar("result", { enum: matchResult }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const leagueInvites = pgTable(
  "league_invite",
  {
    id: varchar("id", cuidConfig).primaryKey(),
    leagueId: varchar("league_id").references(() => leagues.id),
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

export const users = pgTable("user", {
  id: varchar("id", { length: 100 }).primaryKey(),
  imageUrl: varchar("image_url", { length: 255 }).notNull(),
  name: varchar("name").notNull(),
  defaultLeagueId: varchar("defaultLeagueId", cuidConfig).references(() => leagues.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const leaguesRelations = relations(leagues, ({ many }) => ({
  seasons: many(seasons),
  invites: many(leagueInvites),
  leaguePlayers: many(leaguePlayers),
  leagueTeams: many(leagueTeams),
  members: many(leagueMembers),
  events: many(leagueEvents),
}));

export const leagueInvitesRelations = relations(leagueInvites, ({ one }) => ({
  league: one(leagues, {
    fields: [leagueInvites.leagueId],
    references: [leagues.id],
  }),
}));

export const seasonTeamRelations = relations(seasonTeams, ({ one, many }) => ({
  leagueTeam: one(leagueTeams, {
    fields: [seasonTeams.teamId],
    references: [leagueTeams.id],
  }),
  season: one(seasons, {
    fields: [seasonTeams.seasonId],
    references: [seasons.id],
  }),
  matches: many(teamMatches),
}));

export const userRelations = relations(users, ({ many }) => ({
  leaguePlayers: many(leaguePlayers),
}));

export const leaguePlayerRelations = relations(leaguePlayers, ({ one, many }) => ({
  user: one(users, {
    fields: [leaguePlayers.userId],
    references: [users.id],
  }),
  league: one(leagues, {
    fields: [leaguePlayers.leagueId],
    references: [leagues.id],
  }),
  teamPlayer: many(leagueTeamPlayers),
  seasonPlayers: many(seasonPlayers),
}));

export const leagueTeamRelations = relations(leagueTeams, ({ one, many }) => ({
  league: one(leagues, {
    fields: [leagueTeams.leagueId],
    references: [leagues.id],
  }),
  players: many(leagueTeamPlayers),
}));

export const leagueTeamPlayerRelations = relations(leagueTeamPlayers, ({ one }) => ({
  team: one(leagueTeams, {
    fields: [leagueTeamPlayers.teamId],
    references: [leagueTeams.id],
  }),
  leaguePlayer: one(leaguePlayers, {
    fields: [leagueTeamPlayers.leaguePlayerId],
    references: [leaguePlayers.id],
  }),
}));

export const leagueMemberRelations = relations(leagueMembers, ({ one }) => ({
  league: one(leagues, {
    fields: [leagueMembers.leagueId],
    references: [leagues.id],
  }),
}));

export const seasonRelations = relations(seasons, ({ one, many }) => ({
  seasonPlayers: many(seasonPlayers),
  matches: many(matches),
  seasonTeams: many(seasonTeams),
  league: one(leagues, {
    fields: [seasons.leagueId],
    references: [leagues.id],
  }),
}));

export const leagueEventRelations = relations(leagueEvents, ({ one }) => ({
  league: one(leagues, {
    fields: [leagueEvents.leagueId],
    references: [leagues.id],
  }),
}));

export const seasonPlayerRelations = relations(seasonPlayers, ({ one, many }) => ({
  season: one(seasons, {
    fields: [seasonPlayers.seasonId],
    references: [seasons.id],
  }),
  leaguePlayer: one(leaguePlayers, {
    fields: [seasonPlayers.leaguePlayerId],
    references: [leaguePlayers.id],
  }),
  matches: many(matchPlayers),
}));

export const seasonTeamMatchRelations = relations(teamMatches, ({ one }) => ({
  match: one(matches, {
    fields: [teamMatches.matchId],
    references: [matches.id],
  }),
  seasonTeam: one(seasonTeams, {
    fields: [teamMatches.seasonTeamId],
    references: [seasonTeams.id],
  }),
}));

export const matchRelations = relations(matches, ({ one, many }) => ({
  matchPlayers: many(matchPlayers),
  season: one(seasons, {
    fields: [matches.seasonId],
    references: [seasons.id],
  }),
  teamMatches: many(teamMatches),
}));

export const matchPlayerRelations = relations(matchPlayers, ({ one }) => ({
  match: one(matches, {
    fields: [matchPlayers.matchId],
    references: [matches.id],
  }),
  seasonPlayer: one(seasonPlayers, {
    fields: [matchPlayers.seasonPlayerId],
    references: [seasonPlayers.id],
  }),
}));
