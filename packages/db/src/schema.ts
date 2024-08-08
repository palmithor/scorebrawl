import { relations, sql } from "drizzle-orm";
import { integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import type { LeagueEventData } from "./types";

const defaultTextConfig = { length: 100 };
export const cuidConfig = { length: 32 };

export const leagues = sqliteTable(
  "league",
  {
    id: text("id", cuidConfig).primaryKey(),
    name: text("name", defaultTextConfig).notNull(),
    slug: text("name_slug", defaultTextConfig).notNull(),
    logoUrl: text("logo_url", defaultTextConfig),
    code: text("code", cuidConfig).notNull(),
    archived: integer("archived", { mode: "boolean" }).default(false).notNull(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
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

export const leagueEvents = sqliteTable("league_event", {
  id: text("id", cuidConfig).primaryKey(),
  leagueId: text("league_id", cuidConfig)
    .notNull()
    .references(() => leagues.id),
  type: text("type", {
    enum: leagueEventType,
  }).notNull(),
  data: text("text", { mode: "json" }).$type<LeagueEventData>(),
  createdBy: text("created_by", defaultTextConfig).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const leaguePlayers = sqliteTable(
  "league_player",
  {
    id: text("id", cuidConfig).primaryKey(),
    userId: text("user_id", defaultTextConfig)
      .notNull()
      .references(() => users.id),
    leagueId: text("league_id", cuidConfig)
      .notNull()
      .references(() => leagues.id),
    disabled: integer("disabled", { mode: "boolean" }).default(false).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (player) => ({
    leaguePlayerIdx: uniqueIndex("league_player_uq_idx").on(player.leagueId, player.userId),
  }),
);

export const leagueTeams = sqliteTable("league_team", {
  id: text("id", cuidConfig).primaryKey(),
  name: text("name", defaultTextConfig).notNull(),
  leagueId: text("league_id", cuidConfig)
    .notNull()
    .references(() => leagues.id),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const leagueTeamPlayers = sqliteTable(
  "league_team_player",
  {
    id: text("id", cuidConfig).primaryKey(),
    leaguePlayerId: text("league_player_id", cuidConfig)
      .notNull()
      .references(() => leaguePlayers.id),
    teamId: text("team_id", cuidConfig)
      .notNull()
      .references(() => leagueTeams.id),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (leagueTeamPlayer) => ({
    leagueTeamPlayerIdx: uniqueIndex("league_team_player_uq_idx").on(
      leagueTeamPlayer.teamId,
      leagueTeamPlayer.leaguePlayerId,
    ),
  }),
);

export const leagueMemberRoles = ["viewer", "member", "editor", "owner"] as const;

export const leagueMembers = sqliteTable(
  "league_member",
  {
    id: text("id", cuidConfig).primaryKey(),
    userId: text("user_id", defaultTextConfig).notNull(),
    leagueId: text("league_id", cuidConfig)
      .notNull()
      .references(() => leagues.id),
    role: text("role", {
      enum: leagueMemberRoles,
    }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (player) => ({
    leaguePlayerIdx: uniqueIndex("league_member_uq_idx").on(player.leagueId, player.userId),
  }),
);

const scoreType = ["elo", "3-1-0", "elo-individual-vs-team"] as const;

export const seasons = sqliteTable(
  "season",
  {
    id: text("id", cuidConfig).primaryKey(),
    name: text("name", defaultTextConfig).notNull(),
    slug: text("name_slug", defaultTextConfig).notNull(),
    initialScore: integer("initial_score").notNull(),
    scoreType: text("score_type", { enum: scoreType }).notNull(),
    kFactor: integer("k_factor").notNull(),
    startDate: integer("start_date", { mode: "timestamp_ms" }).notNull(),
    endDate: integer("end_date", { mode: "timestamp_ms" }).notNull(),
    leagueId: text("league_id", cuidConfig)
      .notNull()
      .references(() => leagues.id),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (season) => ({
    slugIdx: uniqueIndex("season_name_slug_uq_idx").on(season.slug),
  }),
);

export const seasonTeams = sqliteTable(
  "season_team",
  {
    id: text("id", cuidConfig).primaryKey(),
    seasonId: text("season_id", cuidConfig)
      .notNull()
      .references(() => seasons.id),
    teamId: text("team_id", cuidConfig)
      .notNull()
      .references(() => leagueTeams.id),
    score: integer("score").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (seasonTeam) => ({
    seasonTeamIdx: uniqueIndex("season_team_uq_idx").on(seasonTeam.seasonId, seasonTeam.teamId),
  }),
);

const matchResult = ["W", "L", "D"] as const;

export const teamMatches = sqliteTable("season_team_match", {
  id: text("id", cuidConfig).primaryKey(),
  seasonTeamId: text("season_team_id", cuidConfig)
    .notNull()
    .references(() => seasonTeams.id),
  matchId: text("match_id", cuidConfig)
    .notNull()
    .references(() => matches.id),
  scoreBefore: integer("score_before").notNull().default(-1),
  scoreAfter: integer("score_after").notNull().default(-1),
  result: text("result", { enum: matchResult }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const seasonPlayers = sqliteTable(
  "season_player",
  {
    id: text("id", cuidConfig).primaryKey(),
    seasonId: text("season_id", cuidConfig)
      .notNull()
      .references(() => seasons.id),
    leaguePlayerId: text("league_player_id", cuidConfig)
      .notNull()
      .references(() => leaguePlayers.id),
    score: integer("score").notNull(),
    disabled: integer("disabled", { mode: "boolean" }).default(false).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (season) => ({
    seasonPlayerIdx: uniqueIndex("season_player_uq_idx").on(season.seasonId, season.leaguePlayerId),
  }),
);

export const matches = sqliteTable("match", {
  id: text("id", cuidConfig).primaryKey(),
  seasonId: text("season_id", cuidConfig)
    .notNull()
    .references(() => seasons.id),
  homeScore: integer("home_score").notNull(),
  awayScore: integer("away_score").notNull(),
  homeExpectedElo: real("home_expected_elo"),
  awayExpectedElo: real("away_expected_elo"),
  createdBy: text("created_by").notNull(),
  updatedBy: text("updated_by").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const matchPlayers = sqliteTable("match_player", {
  id: text("id", cuidConfig).primaryKey(),
  seasonPlayerId: text("season_player_id", cuidConfig)
    .notNull()
    .references(() => seasonPlayers.id),
  homeTeam: integer("home_team", { mode: "boolean" }).default(false).notNull(),
  matchId: text("match_id", cuidConfig)
    .notNull()
    .references(() => matches.id),
  scoreBefore: integer("score_before").notNull().default(-1),
  scoreAfter: integer("score_after").notNull().default(-1),
  result: text("result", { enum: matchResult }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const leagueInvites = sqliteTable(
  "league_invite",
  {
    id: text("id", cuidConfig).primaryKey(),
    leagueId: text("league_id").references(() => leagues.id),
    role: text("role", { enum: leagueMemberRoles }).notNull(),
    code: text("code", cuidConfig).notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (invite) => ({
    codeIdx: uniqueIndex("league_invite_code_uq_idx").on(invite.code),
  }),
);

export const users = sqliteTable("user", {
  id: text("id", { length: 100 }).primaryKey(),
  imageUrl: text("image_url", { length: 255 }).notNull(),
  name: text("name").notNull(),
  defaultLeagueId: text("defaultLeagueId", cuidConfig).references(() => leagues.id),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
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
