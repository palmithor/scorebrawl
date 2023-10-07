import { afterAll, afterEach, beforeAll } from "bun:test";
import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "~/server/db";
import {
  leagueMembers,
  leaguePlayers,
  leagues,
  matches,
  matchPlayers,
  seasonPlayers,
  seasons,
} from "~/server/db/schema";
import { insertAuthUser } from "./util";

const isCI = process.env.CI;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

beforeAll(async () => {
  if (!isCI) {
    Bun.spawn([`${import.meta.dir}/../dev/bin/start-db.sh`, "test"]);
  }
  let success = false;
  for (let i = 0; i < 5; i++) {
    try {
      await migrate(db, { migrationsFolder: "./migrations" });
      success = true;
      break;
    } catch (e) {
      await delay(500);
    }
  }
  if (!success) {
    console.error("Unable to apply migration, exiting...");
    process.exit(1);
  }
});

beforeAll(async () => {
  await insertAuthUser();
});

afterEach(async () => {
  await db.delete(matchPlayers).run();
  await db.delete(matches).run();
  await db.delete(leagueMembers).run();
  await db.delete(seasonPlayers).run();
  await db.delete(leaguePlayers).run();
  await db.delete(seasons).run();
  await db.delete(leagues).run();
});

afterAll(() => {
  if (!isCI) {
    Bun.spawn([`${import.meta.dir}/../dev/bin/stop-db.sh`, "test"]);
  }
});
