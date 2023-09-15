import { afterAll, afterEach, beforeAll } from "bun:test";
import { leagueMembers, leaguePlayers, leagues, seasonPlayers, seasons } from "~/server/db/schema";
import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "~/server/db";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
let pid = "";
beforeAll(async () => {
  const proc = Bun.spawn(["turso", "dev", "--port", "8003"]);
  pid = proc.pid.toString();
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
  await db.delete(leagueMembers).run();
  await db.delete(leaguePlayers).run();
  await db.delete(seasonPlayers).run();
  await db.delete(seasons).run();
  await db.delete(leagues).run();
});
afterAll(() => {
  Bun.spawn(["kill", pid]);
});
