#!/bin/bash
set -e

app_root="$(git rev-parse --show-toplevel)/apps/scorebrawl"

cd "$app_root"

export DATABASE_URL="http://127.0.0.1:8002"

bun run ./src/migrate-db.ts
bun run ./src/populate-user-table.ts

echo "Ran migrations and populated clerk users"
