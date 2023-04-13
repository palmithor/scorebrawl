import z from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getCursor } from "../pagination/paginationUtils";
import { pageQuerySchema } from "../pagination/schema";

const leaguesByUserIdSchema = z.object({
  userId: z.string(),
  pageQuery: pageQuerySchema,
});

export const leagueRouter = createTRPCRouter({
  getLeaguesByUserId: protectedProcedure
    .input(leaguesByUserIdSchema)
    .query(async ({ input, ctx }) => {
      const limit = input.pageQuery.limit;
      const result = await ctx.prisma.league.findMany({
        take: input.pageQuery.limit,
        cursor: getCursor(input.pageQuery),
        where: {
          players: {
            some: {
              userId: input.userId,
            },
          },
        },
        orderBy: { id: "asc" },
      });
      return { data: result, nextCursor: result[limit - 1]?.id };
    }),
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.league.findMany();
  }),
  create: protectedProcedure.query(({ ctx }) =>
    ctx.prisma.league.create({
      data: { name: "random123", createdBy: "derp" },
    })
  ),
});
