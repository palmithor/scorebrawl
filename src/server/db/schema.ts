import { init } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { blob, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { type LeagueEventData } from "~/server/db/types";

const cuidConfig = { length: 32 };
const defaultTextConfig = { length: 100 };
export const createCuid = init(cuidConfig);

export const leagues = sqliteTable(
  "league",
  {
    id: text("id", cuidConfig).primaryKey(),
    name: text("name", defaultTextConfig).notNull(),
    slug: text("name_slug", defaultTextConfig).notNull(),
    logoUrl: text("logo_url", defaultTextConfig),
    visibility: text("visibility", { enum: ["private", "public"] })
      .default("public")
      .notNull(),
    code: text("code", cuidConfig).notNull(),
    archived: integer("archived", { mode: "boolean" }).default(false).notNull(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
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
  leagueId: text("league_id", cuidConfig).notNull(),
  type: text("type", {
    enum: leagueEventType,
  }).notNull(),
  data: blob("data", { mode: "json" }).$type<LeagueEventData>(),
  createdBy: text("created_by").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const leaguePlayers = sqliteTable(
  "league_player",
  {
    id: text("id", cuidConfig).primaryKey(),
    userId: text("user_id", defaultTextConfig).notNull(),
    leagueId: text("league_id", cuidConfig).notNull(),
    disabled: integer("disabled", { mode: "boolean" }).default(false).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (player) => ({
    leaguePlayerIdx: uniqueIndex("league_player_uq_idx").on(player.leagueId, player.userId),
  }),
);

export const leagueTeams = sqliteTable("league_team", {
  id: text("id", cuidConfig).primaryKey(),
  name: text("name", defaultTextConfig).notNull(),
  leagueId: text("league_id", cuidConfig).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const leagueTeamPlayers = sqliteTable("league_team_player", {
  id: text("id", cuidConfig).primaryKey(),
  leaguePlayerId: text("league_player_id", cuidConfig).notNull(),
  teamId: text("team_id", cuidConfig).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

const leagueMemberRoles = ["viewer", "member", "editor", "owner"] as const;

export type LeagueMemberRole = (typeof leagueMemberRoles)[number];

export const leagueMembers = sqliteTable(
  "league_member",
  {
    id: text("id", cuidConfig).primaryKey(),
    userId: text("user_id", defaultTextConfig).notNull(),
    leagueId: text("league_id", cuidConfig).notNull(),
    role: text("role", {
      enum: leagueMemberRoles,
    }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (player) => ({
    leaguePlayerIdx: uniqueIndex("league_member_uq_idx").on(player.leagueId, player.userId),
  }),
);
export const seasons = sqliteTable(
  "season",
  {
    id: text("id", cuidConfig).primaryKey(),
    name: text("name", defaultTextConfig).notNull(),
    slug: text("name_slug", defaultTextConfig).notNull(),
    initialElo: integer("initial_elo").notNull(),
    kFactor: integer("k_factor").notNull(),
    startDate: integer("start_date", { mode: "timestamp" }).notNull(),
    endDate: integer("end_date", { mode: "timestamp" }),
    leagueId: text("league_id", cuidConfig).notNull(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (season) => ({
    slugIdx: uniqueIndex("season_name_slug_uq_idx").on(season.slug),
  }),
);

export const seasonTeams = sqliteTable("season_team", {
  id: text("id", cuidConfig).primaryKey(),
  seasonId: text("season_id", cuidConfig).notNull(),
  teamId: text("team_id", cuidConfig).notNull(),
  elo: integer("elo").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const seasonTeamMatches = sqliteTable("season_team_match", {
  id: text("id", cuidConfig).primaryKey(),
  seasonTeamId: text("season_team_id", cuidConfig).notNull(),
  matchId: text("match_id", cuidConfig).notNull(),
  eloBefore: integer("elo_before").notNull().default(-1),
  eloAfter: integer("elo_after").notNull().default(-1),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const seasonPlayers = sqliteTable(
  "season_player",
  {
    id: text("id", cuidConfig).primaryKey(),
    seasonId: text("season_id", cuidConfig).notNull(),
    leaguePlayerId: text("league_player_id", cuidConfig).notNull(),
    elo: integer("elo").notNull(),
    disabled: integer("disabled", { mode: "boolean" }).default(false).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (season) => ({
    seasonPlayerIdx: uniqueIndex("season_player_uq_idx").on(season.seasonId, season.leaguePlayerId),
  }),
);

export const matches = sqliteTable("match", {
  id: text("id", cuidConfig).primaryKey(),
  seasonId: text("season_id", cuidConfig).notNull(),
  homeScore: integer("home_score").notNull(),
  awayScore: integer("away_score").notNull(),
  homeExpectedElo: real("home_expected_elo").notNull(),
  awayExpectedElo: real("away_expected_elo").notNull(),
  createdBy: text("created_by").notNull(),
  updatedBy: text("updated_by").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const matchPlayers = sqliteTable("match_player", {
  id: text("id", cuidConfig).primaryKey(),
  seasonPlayerId: text("season_player_id", cuidConfig).notNull(),
  homeTeam: integer("home_team", { mode: "boolean" }).notNull(),
  matchId: text("match_id", cuidConfig).notNull(),
  eloBefore: integer("elo_before").notNull().default(-1),
  eloAfter: integer("elo_after").notNull().default(-1),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const users = sqliteTable("user", {
  id: text("id", { length: 100 }).primaryKey(),
  imageUrl: text("image_url", { length: 255 }).notNull(),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const leaguesRelations = relations(leagues, ({ many }) => ({
  seasons: many(seasons),
  leaguePlayers: many(leaguePlayers),
  leagueTeams: many(leagueTeams),
  members: many(leagueMembers),
  events: many(leagueEvents),
}));

export const seasonTeamRelations = relations(seasonTeams, ({ one }) => ({
  leagueTeam: one(leagueTeams, {
    fields: [seasonTeams.teamId],
    references: [leagueTeams.id],
  }),
  season: one(seasons, {
    fields: [seasonTeams.seasonId],
    references: [seasons.id],
  }),
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
}));

export const leagueTeamRelations = relations(leagueTeams, ({ one, many }) => ({
  league: one(leagues, {
    fields: [leagueTeams.leagueId],
    references: [leagues.id],
  }),
  teamPlayers: many(leaguePlayers),
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

export const seasonTeamMatchRelations = relations(seasonTeamMatches, ({ one }) => ({
  match: one(matches, {
    fields: [seasonTeamMatches.matchId],
    references: [matches.id],
  }),
  seasonTeam: one(seasonTeams, {
    fields: [seasonTeamMatches.seasonTeamId],
    references: [seasonTeams.id],
  }),
}));

export const matchRelations = relations(matches, ({ one, many }) => ({
  matchPlayers: many(matchPlayers),
  season: one(seasons, {
    fields: [matches.seasonId],
    references: [seasons.id],
  }),
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
