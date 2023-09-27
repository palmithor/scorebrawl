#!/bin/bash

script_dir="$(dirname "$0")"
repository_root="$(git rev-parse --show-toplevel)"
db_name="scorebrawl.db"
db_file="${repository_root}/dev/.local/${db_name}"

if [ ! -f $db_file ]
then
    echo "Creating db file"
    cd "${repository_root}/dev/.local"
    sqlite3 ${db_name} "VACUUM"
    sqlite3 ${db_name} 'PRAGMA journal_mode=WAL;'
else
    echo "DB file already exists"
fi

nohup turso dev --port 8002 --db-file "$db_file" > turso.out 2>&1 &

cd $(git rev-parse --show-toplevel)

export DATABASE_URL="http://127.0.0.1:8002"

bun run ./src/migrate-db.ts

echo "turso dev db started and migrations have run"
