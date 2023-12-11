import { type ResultSet } from "@libsql/client";
import {
  type ExtractTablesWithRelations,
  type InferInsertModel,
  type InferSelectModel,
} from "drizzle-orm";
import { type LibSQLDatabase } from "drizzle-orm/libsql";
import { type SQLiteTransaction } from "drizzle-orm/sqlite-core";
import { type leagues, type seasons } from "~/server/db/schema";
import type * as schema from "./schema";

export type LeagueModel = InferSelectModel<typeof leagues>;
export type Season = InferSelectModel<typeof seasons>;
export type NewSeason = InferInsertModel<typeof seasons>;

export type Db = LibSQLDatabase<typeof schema>;
export type DbTransaction = SQLiteTransaction<
  "async",
  ResultSet,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

export type LeagueEventData = PlayerJoinedEventData | SeasonCreatedEventData;

export type PlayerJoinedEventData = {
  leaguePlayerId: string;
};

export type SeasonCreatedEventData = {
  seasonId: string;
};
