#!/bin/bash
set -e

repository_root="$(git rev-parse --show-toplevel)"

cd "${repository_root}/apps/scorebrawl"

bun run ./scripts/migrate-db.ts
echo "Running migrations and populating clerk users"
bun run ./scripts/populate-user-table.ts

echo "Ran migrations and populated clerk users"
