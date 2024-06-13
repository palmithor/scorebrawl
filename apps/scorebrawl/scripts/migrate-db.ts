import { db } from "@scorebrawl/db";
import { migrate } from "drizzle-orm/neon-http/migrator";

console.log("database url:", process.env.DRIZZLE_DATABASE_URL);

await migrate(db, { migrationsFolder: "./migrations" });

console.log("hello");
