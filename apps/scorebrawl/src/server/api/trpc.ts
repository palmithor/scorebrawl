import type { SignedInAuthObject, SignedOutAuthObject } from "@clerk/backend";
import { LeagueRepository } from "@scorebrawl/db";
/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError, z } from "zod";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: {
  headers: Headers;
  auth: SignedOutAuthObject | SignedInAuthObject;
}) => {
  return {
    ...opts,
  };
};

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      auth: ctx.auth,
    },
  });
});

const leagueAccessMiddleware = isAuthed.unstable_pipe(async ({ ctx, input, next }) => {
  const league = await LeagueRepository.findLeagueBySlug({
    userId: ctx.auth.userId,
    leagueSlug: (input as { leagueSlug: string }).leagueSlug as string,
  });
  if (!league) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }

  return next({
    ctx: {
      ...ctx,
      league,
    },
  });
});

const leagueEditorAccessMiddleware = isAuthed
  .unstable_pipe(leagueAccessMiddleware)
  .unstable_pipe(async ({ ctx, next }) => {
    const hasEditorAccess = await LeagueRepository.hasLeagueEditorAccess({
      userId: ctx.auth.userId,
      leagueId: ctx.league.id,
    });
    if (!hasEditorAccess) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    return next({
      ctx: {
        ...ctx,
      },
    });
  });

export const leagueProcedure = t.procedure
  .input(z.object({ leagueSlug: z.string().min(1) }))
  .use(leagueAccessMiddleware);

export const leagueEditorProcedure = t.procedure
  .input(z.object({ leagueSlug: z.string().min(1) }))
  .use(leagueEditorAccessMiddleware);

export const protectedProcedure = t.procedure.use(isAuthed);
