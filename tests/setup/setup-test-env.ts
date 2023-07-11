import "./setup-env-vars.ts";
import { afterAll, afterEach, beforeEach, vi } from "vitest";
import "dotenv/config";
import fs from "fs";
import { BASE_DATABASE_PATH, DATABASE_PATH, DATABASE_URL } from "./paths";
import { createTestDbClient } from "./utils";
import { deleteAllData } from "./utils";

vi.mock("~/server/db/client.ts", () => {
  return { client: createTestDbClient() };
});

fs.copyFileSync(BASE_DATABASE_PATH, DATABASE_PATH);

afterEach(async () => {
  await deleteAllData();
});

afterAll(async () => {
  await fs.promises.rm(DATABASE_PATH);
});
