#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"

docker-compose -f ./docker/docker-compose-test.yml up -d

echo '🟡 - Waiting for database to be ready...'

$DIR/wait-for-it.sh -t 1 "127.0.0.1:26257" -- echo '🟢 - Database is ready!'


if [ "$CI" = true ] ; then
    sleep 6
fi

yarn prisma migrate dev --name init
