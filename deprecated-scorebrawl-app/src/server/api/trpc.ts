import {
  type SignedInAuthObject,
  type SignedOutAuthObject,
  createClerkClient,
  getAuth,
} from "@clerk/nextjs/server";
import { TRPCError, experimental_standaloneMiddleware, initTRPC } from "@trpc/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";
import z, { ZodError } from "zod";
import { env } from "~/env.mjs";
import { logger } from "~/lib/logger";
import { fullName } from "~/lib/string-utils";
import { getLeagueBySlug } from "~/server/api/league/league.repository";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { type Db } from "~/server/db/types";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */
export type AuthContext = { auth: SignedInAuthObject | SignedOutAuthObject };

type CreateContextOptions = AuthContext;
/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-serverapitrpcts
 */
export const createInnerTRPCContext = ({ auth }: CreateContextOptions) => {
  return {
    auth,
    db,
  };
};

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = ({ req }: CreateNextContextOptions) => ({
  req,
  ...createInnerTRPCContext({ auth: getAuth(req) }),
});

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

const t = initTRPC.context<typeof createTRPCContext>().create({
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

const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });

// check if the user is signed in, otherwise through a UNAUTHORIZED CODE
const isAuthenticated = t.middleware(async ({ next, ctx }) => {
  if (!ctx.auth?.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const user = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.id, ctx.auth.userId as string),
    columns: { id: true },
  });
  if (!user) {
    logger.info("User doesn't exist in database, fetching to clerk.");
    const clerkUser = await clerk.users.getUser(ctx.auth.userId);
    await db
      .insert(users)
      .values({
        id: clerkUser.id,
        name: fullName({
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
        }),
        imageUrl: clerkUser.imageUrl,
        createdAt: new Date(clerkUser.createdAt),
        updatedAt: new Date(clerkUser.updatedAt),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          name: fullName({
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
          }),
          imageUrl: clerkUser.imageUrl,
          updatedAt: new Date(clerkUser.updatedAt),
        },
      });
  }

  return next({
    ctx: {
      auth: ctx.auth,
    },
  });
});

const leagueAccessMiddleware = experimental_standaloneMiddleware<{
  ctx: { auth: SignedInAuthObject | SignedOutAuthObject; db: Db };
  input: { leagueSlug: string };
}>().create(async ({ ctx, input, next }) => {
  if (!ctx.auth?.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const league = await getLeagueBySlug({
    userId: ctx.auth.userId,
    slug: input.leagueSlug,
  });

  return next({
    ctx: {
      auth: ctx.auth,
      league: league,
    },
  });
});

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

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthenticated);
export const leagueProcedure = t.procedure
  .input(z.object({ leagueSlug: z.string().nonempty() }))
  .use(leagueAccessMiddleware);
