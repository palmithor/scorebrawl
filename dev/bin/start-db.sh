#!/bin/bash

script_dir="$(dirname "$0")"
db_file="${script_dir}/../.local/file.db"

if [ ! -f $db_file ] 
then
    echo "Creating db file"
    current_dir=$(pwd)
    cd "$script_dir/../local"
    sqlite3 file.db "VACUUM;"
    cd $current_dir
else
    echo "DB file already exists"
fi

nohup turso dev --port 8002 --db-file "$db_file" > /dev/null 2>&1 &

cd "${script_dir}/../../"

export DATABASE_URL="http://localhost:8002"

bun run db:push 

echo "turso dev db started and migrations run"