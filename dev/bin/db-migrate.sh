#!/bin/bash
set -e

repository_root="$(git rev-parse --show-toplevel)"

export DATABASE_URL="http://127.0.0.1:8002"

cd "${repository_root}/apps/scorebrawl"

bun run ./scripts/migrate-db.ts
bun run ./scripts/populate-user-table.ts

echo "Ran migrations and populated clerk users"
