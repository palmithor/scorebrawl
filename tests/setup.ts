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

const isCI = process.env.CI;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
let pid = "";
beforeAll(async () => {
  if (!isCI) {
    const proc = Bun.spawn(["turso", "dev", "--port", "8003"]);
    pid = proc.pid.toString();
  }
  for (let i = 0; i < 5; i++) {
    try {
      await migrate(db, { migrationsFolder: "./migrations" });
      break;
    } catch (e) {
      await delay(500);
    }
  }
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
    Bun.spawn(["kill", pid]);
  }
});
