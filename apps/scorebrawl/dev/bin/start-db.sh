#!/bin/bash

env="${1:-"dev"}"

allowed_env=('dev' 'test')

if [[ ! "${allowed_env[*]}" =~ $env ]]; then
  echo "Unsupported env. Supported are (${allowed_env[*]})"
  exit 1
fi

app_root="$(git rev-parse --show-toplevel)/apps/scorebrawl"

if [ "$env" == "dev" ]; then
  db_name="scorebrawl.db"
  db_file="${app_root}/dev/.local/${db_name}"

  if [ ! -f $db_file ]; then
    echo "Creating db file"
    mkdir -p "${app_root}/dev/.local"
    cd "${app_root}/dev/.local"
    sqlite3 ${db_name} "VACUUM"
    sqlite3 ${db_name} 'PRAGMA journal_mode=WAL;'
  else
    echo "DB file already exists"
  fi

  nohup turso dev --port 8002 --db-file "$db_file" >"${app_root}/dev/.local/out.log" 2>&1 &

  echo $! >$app_root/dev/.local/turso-dev-pid.nohup

  echo "turso dev db started"
else
  nohup turso dev --port 8003 >/dev/null 2>&1 &
  echo $! >$app_root/dev/.local/turso-test-pid.nohup
fi
