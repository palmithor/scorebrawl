import { type InferModel } from "drizzle-orm";
import { type leagues, type seasons } from "~/server/db/schema";
import { type LibSQLDatabase } from "drizzle-orm/libsql";
import type * as schema from "./schema";

export type League = InferModel<typeof leagues, "select">;
export type NewLeague = InferModel<typeof leagues, "insert">;
export type Season = InferModel<typeof seasons, "select">;
export type NewSeason = InferModel<typeof seasons, "insert">;

export type Db = LibSQLDatabase<typeof schema>;
