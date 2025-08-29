# Claude Code Context

## Project Overview

Scorebrawl is a score-tracking application for gaming, sports, and competitions built with a modern tech stack. It's a monorepo using Turborepo with multiple packages and applications.

## Tech Stack

- **Runtime**: Bun (package manager and runtime)
- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS + Shadcn/ui components
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better-Auth with Google OAuth
- **File Uploads**: UploadThing
- **API**: tRPC for type-safe APIs
- **Monitoring**: Sentry
- **Background Jobs**: Trigger.dev
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation

## Project Structure

```
/
├── apps/
│   └── scorebrawl/           # Main Next.js application
├── packages/
│   ├── api/                  # API DTOs and types
│   ├── db/                   # Database schema and repositories
│   ├── model/                # Domain models
│   ├── utils/                # Shared utilities
│   └── typescript-config/    # Shared TypeScript config
└── dev/                      # Development tooling and Docker setup
```

## Development Commands

### Essential Commands
- **Start Development**: `bun run dev` (runs migration + starts Next.js on port 5050)
- **Lint**: `bun flint` (Biome linter with auto-fix)
- **Lint Check**: `bun flint:check` (Biome linter check-only)
- **Build**: `bun run build`
- **Database Start**: `bun run db:start`
- **Database Stop**: `bun run db:stop`

### Database Commands
- **Generate Migration**: `bun run generate-db-changeset`
- **Run Migrations**: Automatically run during `bun run dev`

### Trigger.dev Commands
- **Development**: `bun run trigger`
- **Deploy**: `bun run trigger-deploy`

## Key Architecture Patterns

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL
- **Schema**: Defined in `packages/db/src/schema.ts`
- **Repositories**: Domain-specific repositories in `packages/db/src/repositories/`
- **Migrations**: Located in `apps/scorebrawl/migrations/`

### API Layer
- **Framework**: tRPC for type-safe APIs
- **Routers**: Organized by domain in `src/server/api/routers/`
- **Authentication**: Better-Auth integration with session management
- **Available Routers**: achievement, avatar, invite, league, match, member, leaguePlayer, leagueTeam, seasonPlayer, season, seasonTeam, user

### Frontend Architecture
- **App Router**: Next.js 13+ app directory structure
- **Route Groups**: 
  - `(auth)/`: Authentication pages
  - `(leagues)/`: Main league-related pages
  - `(onboarding)/`: User onboarding flow
  - `(profile)/`: User profile pages
- **Components**: Organized by domain with shared UI components
- **Styling**: Tailwind + Shadcn/ui component library

### State Management
- **Server State**: tRPC with React Query for server state
- **Context**: React Context for league/season context
- **Forms**: React Hook Form with Zod validation

## Environment Variables

Required environment variables (see `apps/scorebrawl/.env.example`):
- `DATABASE_URL`: PostgreSQL connection string
- `BETTER_AUTH_SECRET`: Auth secret key
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `UPLOADTHING_TOKEN`: UploadThing API token
- `TRIGGER_SECRET_KEY`: Trigger.dev secret key

## Development Workflow

1. **Starting Development**: Run `bun run dev` which:
   - Starts Docker containers for infrastructure
   - Runs database migrations
   - Starts Next.js dev server on port 5050

2. **Code Changes**: Always run `bun flint` after making changes

3. **Database Changes**: 
   - Modify schema in `packages/db/src/schema.ts`
   - Generate migration with `bun run generate-db-changeset`
   - Migrations run automatically on dev restart

## Common Patterns

### tRPC Usage
```typescript
import { api } from "@/trpc/react";

// In components
const { data, isLoading } = api.user.me.useQuery();
const { mutate, isPending } = api.user.setPassword.useMutation();
```

### Authentication
```typescript
import { auth } from "@/lib/auth";
// Server-side auth context available in tRPC procedures
```

### Form Handling
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({...});
const form = useForm({ resolver: zodResolver(schema) });
```

### UI Components
- Use Shadcn/ui components from `@/components/ui/`
- Custom components organized by domain in `@/components/`
- Toast notifications via `useToast()` hook

## Testing

- Test framework: Bun test
- Run tests: `bun test`

## Key Dependencies

### Core
- Next.js 15, React 19, TypeScript 5.5
- Bun as package manager and runtime
- Turborepo for monorepo management

### UI/Styling
- Tailwind CSS with custom configuration
- Shadcn/ui component library
- Lucide React icons
- Recharts for data visualization

### Backend/Data
- tRPC for API layer
- Drizzle ORM with PostgreSQL
- Better-Auth for authentication
- Trigger.dev for background jobs

### Utilities
- Zod for schema validation
- Date-fns for date manipulation
- React Hook Form for form handling
- LRU-cache for caching