#!/usr/bin/env bash
set -e


DIR="$(cd "$(dirname "$0")" && pwd)"
docker-compose -f docker-compose-it.yml up -d
echo '🟡 - Waiting for database to be ready...'

export DATABASE_URL="postgresql://root:@localhost:26257/pointup-vitest"
$DIR/wait-for-it.sh -t 1 "${DATABASE_URL}" -- echo '🟢 - Database is ready!'

yarn prisma migrate dev --name init

yarn test
