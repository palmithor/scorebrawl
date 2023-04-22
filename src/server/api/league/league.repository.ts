import { prisma } from "~/server/db";
import { type League, LeagueMemberRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const getByIdWhereMember = async ({
  userId,
  leagueId,
  allowedRoles,
}: {
  userId: string;
  leagueId: string;
  allowedRoles?: LeagueMemberRole[];
}): Promise<League | null> =>
  prisma.league.findFirst({
    where: {
      id: leagueId,
      members: {
        some: {
          userId,
          role: {
            in: allowedRoles ?? [
              LeagueMemberRole.editor,
              LeagueMemberRole.member,
              LeagueMemberRole.owner,
              LeagueMemberRole.viewer,
            ],
          },
        },
      },
    },
  });
