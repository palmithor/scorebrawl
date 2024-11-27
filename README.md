# Scorebrawl

Scorebrawl is the ultimate score-tracking solution for gaming, sports, and competitions, bringing your victories to life
in real-time

# Getting started

## Dev environment

Developing in Scorebrawl requires [bun](https://bun.sh/) and [neon](https://neon.tech/) along
with [better-auth](https://www.better-auth.com) and [uploadthing](https://uploadthing.com) credentials.

## Development environment

### Setup

Neon database has to be set up for the development environment.

Uploadthing credentials have to be set up in the environment variables.

Google OAuth Client Credentials have to be set up.

See `apps/scorebrawl/.env.example` for the required environment variables.

### Running the development server

Run db migrations and start the development server by executing `bun run dev`.

# Stack

- Bun
- NextJS
- Better-Auth
- Uploadthing
- Shadcn
- Tailwind
- Neon
