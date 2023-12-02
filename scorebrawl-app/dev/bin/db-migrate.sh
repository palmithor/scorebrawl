#!/bin/bash
set -e

repository_root="$(git rev-parse --show-toplevel)"

cd "$repository_root"

export DATABASE_URL="http://127.0.0.1:8002"

bun run ./src/migrate-db.ts
bun run ./src/populate-user-table.ts

echo "Ran migrations and populated clerk users"
