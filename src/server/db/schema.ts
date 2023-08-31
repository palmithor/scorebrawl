import { relations } from "drizzle-orm";
import { integer, sqliteTable, real, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { init } from "@paralleldrive/cuid2";

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
  })
);

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
  })
);

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
  })
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
  })
);

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
  })
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
  elo: integer("elo"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const leaguesRelations = relations(leagues, ({ many }) => ({
  seasons: many(seasons),
  leaguePlayers: many(leaguePlayers),
  members: many(leagueMembers),
}));

export const leaguePlayerRelations = relations(leaguePlayers, ({ one }) => ({
  league: one(leagues, {
    fields: [leaguePlayers.leagueId],
    references: [leagues.id],
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
  league: one(leagues, {
    fields: [seasons.leagueId],
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
