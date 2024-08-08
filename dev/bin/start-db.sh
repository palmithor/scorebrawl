#!/bin/bash

env="${1:-"dev"}"

allowed_env=('dev' 'test')

if [[ ! "${allowed_env[*]}" =~ $env ]]; then
  echo "Unsupported env. Supported are (${allowed_env[*]})"
  exit 1
fi

script_dir="$(dirname "$0")"
repository_root="$(git rev-parse --show-toplevel)"

if [ "$env" == "dev" ]; then
  db_name="scorebrawl.db"
  db_file="${repository_root}/dev/.local/${db_name}"

  if [ ! -f $db_file ]; then
    echo "Creating db file"
    mkdir -p "${repository_root}/dev/.local"
    cd "${repository_root}/dev/.local"
    sqlite3 ${db_name} "VACUUM"
    sqlite3 ${db_name} 'PRAGMA journal_mode=WAL;'
  else
    echo "DB file already exists"
  fi

  nohup turso dev --port 63281 --db-file "$db_file" > "${repository_root}"/dev/.local/nohup.log 2>&1 &

  echo $! >${repository_root}/dev/.local/turso-dev-pid.nohup

  PID=$!

  # Check if the process is still running
  if ! ps -p $PID > /dev/null; then
      echo "your_command failed to start correctly."
      echo "Check output.log for details."
      exit 1
  fi

  echo "turso dev db started"
else
  nohup turso dev --port 63282 >/dev/null 2>&1 &
  echo $! >${repository_root}/dev/.local/turso-test-pid.nohup
fi
