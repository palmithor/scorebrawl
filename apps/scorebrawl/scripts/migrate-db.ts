import { migrateDb } from "@scorebrawl/db";

try {
  await migrateDb();
  process.exit(0);
} catch (err) {
  console.error(err);
  process.exit(1);
}
