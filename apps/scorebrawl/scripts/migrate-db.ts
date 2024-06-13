import { db } from "@scorebrawl/db";
import { migrate } from "drizzle-orm/neon-http/migrator";

await migrate(db, { migrationsFolder: "./migrations" });
