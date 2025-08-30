# Scorebrawl Repository

Scorebrawl is the ultimate score-tracking solution for gaming, sports, and competitions, bringing your victories to life in real-time. This is a full-stack TypeScript application built with modern web technologies.

## Architecture Overview

This is a **Turborepo monorepo** managed with **Bun** (not npm), featuring multiple applications and shared packages. The repository follows a modular architecture with clear separation of concerns.

### Repository Structure

```
scorebrawl-nextjs/
├── apps/
│   ├── landing/           # Marketing/landing page
│   └── scorebrawl/        # Main application
│       └── src/
│           ├── db/        # Database layer (Drizzle ORM)
│           ├── model/     # Data models and types
│           ├── server/    # API utilities and configurations
│           └── ...        # Other application code
├── packages/
│   ├── typescript-config/ # Shared TypeScript configurations
│   └── utils/             # Shared utility functions
├── package.json           # Root workspace configuration
├── turbo.json            # Turborepo configuration
└── biome.json            # Biome linting/formatting configuration
```

## Technology Stack

### Core Technologies
- **Runtime**: Bun (package manager and runtime)
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.5+
- **Monorepo**: Turborepo
- **Database**: PostgreSQL (Supabase) with optional PGlite for development
- **ORM**: Drizzle ORM
- **Authentication**: Better-Auth (comprehensive documentation: https://www.better-auth.com/llms.txt)
- **File Uploads**: UploadThing
- **Styling**: Tailwind CSS + Shadcn/ui components

### Development Tools
- **Linting/Formatting**: Biome (`flint` command)
- **Testing**: Bun test + Playwright (E2E)
- **Background Jobs**: Trigger.dev
- **Monitoring**: Sentry
- **Deployment**: Vercel

## Getting Started

### Prerequisites
1. **Bun**: Install from [bun.sh](https://bun.sh/)
2. **Database**: Supabase account and project
3. **Authentication**: Google OAuth credentials
4. **File Storage**: UploadThing account
5. **Optional**: Trigger.dev account for background jobs

### Environment Setup

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd scorebrawl-nextjs
   bun install
   ```

2. **Environment Variables**:
   Copy `apps/scorebrawl/.env.example` to `apps/scorebrawl/.env.local` and configure:
   ```env
   # Database
   DATABASE_URL="postgresql://..."
   
   # Authentication
   BETTER_AUTH_SECRET="your-secret"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # File Upload
   UPLOADTHING_TOKEN="your-uploadthing-token"
   
   # Optional: Background Jobs
   TRIGGER_SECRET_KEY="your-trigger-key"
   
   # Optional: Monitoring
   SENTRY_AUTH_TOKEN="your-sentry-token"
   ```

3. **Database Setup**:
   ```bash
   # Run database migrations (from the main app directory)
   cd apps/scorebrawl
   bun run drizzle-generate
   ```

### Development Commands

```bash
# Start development server
bun run dev                    # Start main app only

# Database management
bun run drizzle-generate      # Generate database migrations
bun run drizzle-migrate       # Run database migrations  
bun run drizzle-studio        # Open Drizzle Studio
bun run db-start              # Start local database (Docker)
bun run db-stop               # Stop local database

# Code quality
bun run flint                 # Format and lint all code
bun run flint-check          # Check formatting/linting

# Testing
bun run test                  # Run all tests

# Building
bun run build                 # Build all apps for production
```

### Development with Postgres locally

bun

```bash
bun run dev
```

## Package Architecture

### Apps

#### `apps/scorebrawl` - Main Application
The core Scorebrawl application built with Next.js 15:
- **Framework**: Next.js with App Router
- **Authentication**: Better-Auth integration
- **Database**: Drizzle ORM with PostgreSQL (integrated in `src/db/`)
- **Models**: TypeScript types and data models (integrated in `src/model/`)
- **API**: Server-side API utilities (integrated in `src/server/`)
- **UI**: Shadcn/ui components with Tailwind CSS
- **Features**: Score tracking, leagues, matches, player management

#### `apps/landing` - Landing Page
Marketing website for Scorebrawl.

### Packages

#### `packages/utils` - Utility Functions
Shared utility functions:
- Date/time helpers
- String manipulation utilities
- ID generation utilities

**Key exports**:
```typescript
// Utility functions
import { formatDate } from "@scorebrawl/utils/date"
import { generateId } from "@scorebrawl/utils/id"
import { capitalizeFirst } from "@scorebrawl/utils/string"
```

#### `packages/typescript-config` - TypeScript Configuration
Shared TypeScript configurations:
- `base.json` - Base TypeScript config
- `nextjs.json` - Next.js specific config
- `react-library.json` - React library config

## Authentication with Better-Auth

The application uses Better-Auth for authentication. Comprehensive documentation is available at: https://www.better-auth.com/llms.txt

### Authentication Patterns

#### Server-side Authentication
```typescript
import { auth } from "@/auth"
import { headers } from "next/headers"

// Get session in server components/API routes
const session = await auth.api.getSession({
  headers: await headers()
})

if (!session) {
  // Handle unauthenticated user
  return redirect("/auth/sign-in")
}
```

#### Client-side Authentication
```typescript
import { authClient } from "@/auth-client"

// Sign in with email/password
const { data } = await authClient.signIn.email({
  email: "user@email.com",
  password: "password"
})

// Sign in with Google OAuth
const { data } = await authClient.signIn.social({
  provider: "google"
})

// Get current session
const session = authClient.useSession()
```

#### Key Configuration
- Email/password authentication enabled
- Google OAuth configured
- Session management with database storage
- Middleware-based route protection
- Type-safe auth hooks and utilities

## Database Schema

The application uses Drizzle ORM with a PostgreSQL database. Key entities include:

- **Users**: User accounts and profiles
- **Leagues**: Competition leagues and tournaments
- **Seasons**: Time-based competition periods
- **Matches**: Individual games/competitions
- **Players**: League participants
- **Teams**: Team-based competitions
- **Achievements**: User accomplishments
- **Notifications**: User notifications

## Deployment

### Vercel Deployment
The application is optimized for Vercel deployment:

1. **Environment Variables**: Configure all required env vars in Vercel dashboard
2. **Database**: Ensure Supabase connection string is set
3. **Build**: Turborepo automatically handles build optimization

### Database Migrations
Migrations are handled automatically in production environments through Vercel build process.

## Development Guidelines

### Code Quality
- **Formatting**: Use `bun run flint` to format code with Biome
- **Type Safety**: Maintain strict TypeScript types throughout
- **Components**: Use Shadcn/ui components for consistency
- **Database**: Access database layer through `src/db/` in the main app
- **Models**: Import types from `src/model/` in the main app
- **Utilities**: Use shared utilities from `@scorebrawl/utils` package
- **Database Queries**: **ALWAYS** use Drizzle ORM queries instead of raw SQL. Use functions like `eq()`, `and()`, `or()`, `lt()`, `gt()`, etc. from drizzle-orm instead of writing raw SQL strings
- **IMPORTANT**: Always run `bun flint` before wrapping up TypeScript code to ensure proper formatting and linting

### Import Patterns
```typescript
// Database access (from within scorebrawl app)
import { db } from "@/db"
import { userRepository } from "@/db/repositories/user"

// Models and types (from within scorebrawl app)  
import type { User, Match } from "@/model"

// Shared utilities (from any app/package)
import { formatDate } from "@scorebrawl/utils/date"
import { generateId } from "@scorebrawl/utils/id"
```

### Testing Strategy
- **Unit Tests**: Bun test for utilities and business logic
- **E2E Tests**: Playwright for user workflows
- **Database Tests**: PGlite for isolated database testing

### Performance Considerations
- **Bundle Size**: Leverage tree-shaking with Bun and Turborepo
- **Database**: Use connection pooling and efficient queries
- **Caching**: Implement appropriate caching strategies
- **Image Optimization**: Use Next.js Image component with UploadThing

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure DATABASE_URL is correctly formatted
2. **Authentication**: Verify Google OAuth credentials
3. **File Uploads**: Check UploadThing token and configuration
4. **Build Errors**: Clear `.next` cache and rebuild

## Contributing

1. **Code Style**: Follow existing patterns and use `bun run flint`
2. **Database Changes**: Create migrations with `bun run drizzle-generate`
3. **Testing**: Add tests for new features
4. **Documentation**: Update relevant documentation

## Additional Resources

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Better-Auth Documentation](https://better-auth.com)
- [Biome Documentation](https://biomejs.dev)
