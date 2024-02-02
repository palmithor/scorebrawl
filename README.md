# Scorebrawl

Scorebrawl is the ultimate score-tracking solution for gaming, sports, and competitions, bringing your victories to life in real-time

# Getting started

## Dev environment

Developing in Scorebrawl requires [bun](https://bun.sh/) and [turso](https://turso.tech/) along with [Clerk](https://clerk.com) and [uploadthing](https://uploadthing.com) credentials.

The development server and database can be run completely locally.
In addition to the tools listed above `sqld` is needed.

To install these tools on Mac OS do the following

```
brew install tursodatabase/tap/turso
curl -fsSL https://bun.sh/install | bash

brew tap libsql/sqld
brew install sqld-beta
```

## Development environment

### Local DB

In order to start a local database, both `turso` and `sqld` need to be installed.

To start a local database:

`./dev/bin/start-db.sh`

This creates a database file and stores the parent pid in `./dev/.local`.

To stop the database run

`./dev/bin/stop-db.sh`

Before running the development environment some environment variables have to be set up. Replace the secret keys and run the following in the source root.

```
# Scorebrawl dev public key
echo "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZmFuY3ktY293LTc5LmNsZXJrLmFjY291bnRzLmRldiQ" >> .env.development
echo "CLERK_SECRET_KEY=<secretKey>" >> .env.development
echo "CLERK_WEBHOOK_SECRET=ignore" >> .env.development
# Port 8002 is hard coded in start-db script
echo "DATABASE_URL=http://127.0.0.1:8002" >> .env.development
echo "UPLOADTHING_APP_ID=cjmox8rnt4" >> .env.development
echo "UPLOADTHING_SECRET=<secretKey>" >> .env.development
echo "UPLOADTHING_URL=http://localhost:3000" >> .env.development
```

Run db migrations and start the development server by executing `bun run dev`.

## Testing

Tests require `turso` to be installed as tests are run against in-memory database.
The in-memory database is started and shut down as part of the test execution.

Tests are executed by running

`bun run test`

# Stack

- Bun
- NextJS
- Clerk Authentication
- Uploadthing
- Shadcn
- Tailwind
- Turso
