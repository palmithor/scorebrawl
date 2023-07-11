import {
  leagueMembers,
  leaguePlayers,
  leagues,
  seasonPlayers,
  seasons,
} from "~/server/db/schema";
import { createClient } from "@libsql/client";
import { DATABASE_URL } from "./paths";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "~/server/db/schema";

export const createTestDbClient = () => {
  return createClient({ url: DATABASE_URL });
};
export const deleteAllData = async () => {
  const db = drizzle(createTestDbClient(), { schema });
  await db.delete(leagueMembers).run();
  await db.delete(leaguePlayers).run();
  await db.delete(seasonPlayers).run();
  await db.delete(seasons).run();
  await db.delete(leagues).run();
};
