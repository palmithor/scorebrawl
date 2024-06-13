import { afterAll, afterEach, beforeAll } from "bun:test";
import { db } from "@scorebrawl/db";
import {
  leagueMembers,
  leaguePlayers,
  leagues,
  matchPlayers,
  matches,
  seasonPlayers,
  seasons,
} from "@scorebrawl/db";
import { $ } from "bun";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { insertAuthUser } from "./util";

const isCI = process.env.CI;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getRepositoryRoot = async () => $`printf "$(git rev-parse --show-toplevel)"`.text();

beforeAll(async () => {
  const repositoryRoot = await getRepositoryRoot();
  if (!isCI) {
    Bun.spawn([`${repositoryRoot}/dev/bin/start-db.sh`, "test"]);
  }
  let success = false;
  let e: Error | undefined = undefined;
  for (let i = 0; i < 5; i++) {
    try {
      await migrate(db, { migrationsFolder: "./migrations" });
      success = true;
      break;
    } catch (err) {
      e = err instanceof Error ? err : new Error("Unknown error");
      await delay(500);
    }
  }
  if (!success) {
    console.error("Unable to apply migration, exiting...", e);
    if (!isCI) {
      Bun.spawn([`${repositoryRoot}/dev/bin/stop-db.sh`, "test"]);
    }
    process.exit(1);
  }
});

beforeAll(async () => {
  try {
    await insertAuthUser();
  } catch {
    //ignore
  }
});

afterEach(async () => {
  await db.delete(matchPlayers);
  await db.delete(matches);
  await db.delete(leagueMembers);
  await db.delete(seasonPlayers);
  await db.delete(leaguePlayers);
  await db.delete(seasons);
  await db.delete(leagues);
});

afterAll(async () => {
  const repositoryRoot = await getRepositoryRoot();
  if (!isCI) {
    Bun.spawn([`${repositoryRoot}/dev/bin/stop-db.sh`, "test"]);
  }
});
