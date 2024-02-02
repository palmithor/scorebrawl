import { db } from "@scorebrawl/db";
import { migrate } from "drizzle-orm/libsql/migrator";

await migrate(db, { migrationsFolder: "./migrations" });
