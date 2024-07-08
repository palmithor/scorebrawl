import { editorRoles } from "@/utils/permissionUtil";
import type { AuthObject } from "@clerk/backend/internal";
import { LeagueRepository } from "@scorebrawl/db";
import { initTRPC } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError, z } from "zod";

export const createTRPCContext = async (opts: {
  headers: Headers;
  auth: AuthObject;
}) => {
  return {
    ...opts,
  };
};

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

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
  const leagueInfo = await LeagueRepository.getLeagueBySlugWithMembership({
    userId: ctx.auth.userId,
    leagueSlug: (input as { leagueSlug: string }).leagueSlug ?? "",
  });
  if (!leagueInfo) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }

  return next({
    ctx: {
      ...ctx,
      leagueInfo,
    },
  });
});

const leagueEditorAccessMiddleware = isAuthed
  .unstable_pipe(leagueAccessMiddleware)
  .unstable_pipe(async ({ ctx, next }) => {
    if (!editorRoles.includes(ctx.leagueInfo.role)) {
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
