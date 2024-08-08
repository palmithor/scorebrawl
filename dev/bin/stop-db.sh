#!/bin/bash

set -e

env="${1:-"dev"}"
allowed_env=('dev' 'test')

if [[ ! "${allowed_env[*]}" =~ $env ]]; then
  echo "Unsupported env. Supported are (${allowed_env[*]})"
  exit 1
fi

if [ "$env" == "dev" ]; then
  lsof -t -i :63281 | xargs -r kill -9
else
  lsof -t -i :63282 | xargs -r kill -9
fi
