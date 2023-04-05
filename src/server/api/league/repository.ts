import { prisma } from "~/server/db";
import type z from "zod";
import { type pageQuerySchema } from "../pagination/schema";
import { getCursor } from "../pagination/paginationUtils";
import { PrismaClient } from "@prisma/client";

const leagueExtensions = {
  model: {
    league: {
      async getByUserId({
        userId,
        pageQuery,
      }: {
        userId: string;
        pageQuery: z.infer<typeof pageQuerySchema>;
      }) {
        return await prisma.league.findMany({
          take: pageQuery.limit,
          cursor: getCursor(pageQuery),
          where: {
            players: {
              some: {
                userId,
              },
            },
          },
          orderBy: { id: "asc" },
        });
      },
    },
  },
};
