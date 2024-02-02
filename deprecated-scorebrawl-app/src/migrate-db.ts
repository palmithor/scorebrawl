import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "~/server/db";

await migrate(db, { migrationsFolder: "./migrations" });
