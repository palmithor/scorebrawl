#!/usr/bin/env bun

import { join } from "node:path";
import { $ } from "bun";

async function importDump(): Promise<void> {
  const scriptDir = import.meta.dir;
  const dumpFile = process.argv[2] || join(scriptDir, "anonymized-dump.sql");
  const dbUrl = "postgresql://scorebrawl:scorebrawl@localhost:65432/scorebrawl-e2e";

  console.log(`Importing SQL dump: ${dumpFile}`);
  console.log(`Target database: ${dbUrl}`);

  try {
    // Import the SQL dump using psql
    await $`psql ${dbUrl} -f ${dumpFile}`.quiet();

    console.log("✅ Database import completed successfully!");
  } catch (error) {
    console.error("❌ Error importing database:", error);
    process.exit(1);
  }
}

// Main execution
importDump();
