#!/bin/bash
set -e

repository_root="$(git rev-parse --show-toplevel)"

# Function to execute docker compose down
cleanup() {
    echo "Stopping Docker containers..."
    cd "${repository_root}/dev/docker"
    docker compose down >/dev/null 2>&1
}

handle_error() {
    echo "An error occurred. Cleaning up..."
    cleanup
}

# Set up trap to call cleanup function on SIGINT and SIGTERM
trap cleanup SIGINT
trap handle_error ERR

# Start infrastructure using docker compose
cd "${repository_root}/dev/docker"
docker compose up -d --wait >/dev/null 2>&1

cd "${repository_root}/apps/scorebrawl"

bun run ./scripts/migrate-db.ts >/dev/null 2>&1
echo "Running migrations and populating clerk users"
bun run ./scripts/populate-user-table.ts >/dev/null 2>&1

echo "Ran migrations and populated clerk users"

# Start node service with bun dev
echo "Starting node service..."
bunx next dev --port 5050 &

# Capture the PID of the Node process
NODE_PID=$!

# Wait for the Node process to exit
wait $NODE_PID

# Execute cleanup after Node process exits
cleanup
