#!/bin/bash

set -e

env="${1:-"dev"}"
allowed_env=('dev' 'test')

if [[ ! "${allowed_env[*]}" =~ $env ]]; then
  echo "Unsupported env. Supported are (${allowed_env[*]})"
  exit 1
fi

app_root="$(git rev-parse --show-toplevel)/scorebrawl-app"
pid_file="${app_root}/dev/.local/turso-${env}-pid.nohup"

parent_pid="$(cat $pid_file)"

pgrep -P $parent_pid | xargs kill
kill $parent_pid
rm $pid_file

echo "turso dev db stopped"
