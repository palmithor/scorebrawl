import { z } from "zod";

import { createTRPCRouter, seasonProcedure } from "@/server/api/trpc";
import { getStanding, getTopTeam } from "@scorebrawl/db/season-team";

export const seasonTeamRouter = createTRPCRouter({
  getStanding: seasonProcedure
    .input(z.object({ leagueSlug: z.string(), seasonSlug: z.string() }))
    .query(
      ({
        ctx: {
          season: { id },
        },
      }) => getStanding({ seasonId: id }),
    ),
  getTop: seasonProcedure
    .input(z.object({ leagueSlug: z.string(), seasonSlug: z.string() }))
    .query(async ({ input: { seasonSlug } }) => {
      const topTeam = await getTopTeam({ seasonSlug });
      if (!topTeam || topTeam.length === 0) {
        return null;
      }
      return {
        name: topTeam[0]?.name ?? "",
        players: topTeam.map((t) => ({
          id: t.id,
          name: t.name,
          image: t.image ?? undefined,
        })),
      };
    }),
});
