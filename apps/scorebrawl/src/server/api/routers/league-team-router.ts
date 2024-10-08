import { createTRPCRouter, leagueProcedure, seasonProcedure } from "@/server/api/trpc";
import { editorRoles } from "@/utils/permission-util";
import { LeagueTeamInputDTO } from "@scorebrawl/api";
import { getBySeasonPlayerIds, getLeagueTeams, update } from "@scorebrawl/db/league-team";
import { z } from "zod";

export const leagueTeamRouter = createTRPCRouter({
  getAll: leagueProcedure
    .input(z.object({ leagueSlug: z.string() }))
    .query(({ ctx: { league } }) => getLeagueTeams({ leagueId: league.id })),
  getBySeasonPlayerIds: seasonProcedure
    .input(
      z.object({
        leagueSlug: z.string(),
        seasonSlug: z.string(),
        seasonPlayerIds: z.array(z.string()),
      }),
    )
    .query(({ input: { seasonPlayerIds } }) => getBySeasonPlayerIds({ seasonPlayerIds })),
  update: leagueProcedure.input(LeagueTeamInputDTO).mutation(async ({ input, ctx }) =>
    update({
      ...input,
      userId: ctx.auth.userId,
      isEditor: editorRoles.includes(ctx.role),
    }),
  ),
});
