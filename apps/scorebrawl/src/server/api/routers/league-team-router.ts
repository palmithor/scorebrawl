import { createTRPCRouter, leagueProcedure, seasonProcedure } from "@/server/api/trpc";
import { editorRoles } from "@/utils/permission-util";
import { LeagueTeamInputDTO } from "@scorebrawl/api";
import { LeagueTeamRepository } from "@scorebrawl/db";
import { z } from "zod";

export const leagueTeamRouter = createTRPCRouter({
  getAll: leagueProcedure
    .input(z.object({ leagueSlug: z.string() }))
    .query(({ ctx: { league } }) => LeagueTeamRepository.getLeagueTeams({ leagueId: league.id })),
  getBySeasonPlayerIds: seasonProcedure
    .input(
      z.object({
        leagueSlug: z.string(),
        seasonSlug: z.string(),
        seasonPlayerIds: z.array(z.string()),
      }),
    )
    .query(({ input: { seasonPlayerIds } }) =>
      LeagueTeamRepository.getBySeasonPlayerIds({ seasonPlayerIds }),
    ),
  update: leagueProcedure.input(LeagueTeamInputDTO).mutation(async ({ input, ctx }) =>
    LeagueTeamRepository.update({
      ...input,
      userId: ctx.auth.userId,
      isEditor: editorRoles.includes(ctx.role),
    }),
  ),
});
