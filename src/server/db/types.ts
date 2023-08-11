import { type InferModel } from "drizzle-orm";
import {
  type leagues,
  type seasons,
  type seasonPlayers,
} from "~/server/db/schema";
import { type LibSQLDatabase } from "drizzle-orm/libsql";
import type * as schema from "./schema";

export type LeagueModel = InferModel<typeof leagues, "select">;
export type League = Omit<LeagueModel, "code">;
export type LeaguePlayer = InferModel<typeof schema.leaguePlayers, "select">;
export type NewLeague = InferModel<typeof leagues, "insert">;
export type Season = InferModel<typeof seasons, "select">;
export type SeasonPlayer = InferModel<typeof seasonPlayers, "select">;
export type NewSeason = InferModel<typeof seasons, "insert">;

export type Db = LibSQLDatabase<typeof schema>;
