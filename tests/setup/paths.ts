import path from "path";

const databaseFile = `./tests/db/data.${process.env.VITEST_POOL_ID || 0}.db`;
export const DATABASE_PATH = path.join(process.cwd(), databaseFile);
export const DATABASE_URL = `file:${DATABASE_PATH}`;

const baseDatabaseFile = `./tests/db/base.db`;
export const BASE_DATABASE_PATH = path.join(process.cwd(), baseDatabaseFile);
export const BASE_DATABASE_URL = `file:${BASE_DATABASE_PATH}`;
