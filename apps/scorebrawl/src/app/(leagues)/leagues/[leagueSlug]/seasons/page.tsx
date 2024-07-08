import { getHasEditorAccess } from "@/actions/league";
import { getAll } from "@/actions/season";
import { SeasonTable } from "@/components/season/season-table";
import { sortSeasons } from "@/utils/seasonUtils";
import { auth } from "@clerk/nextjs/server";
import { LeagueRepository } from "@scorebrawl/db";

export default async function ({ params }: { params: { leagueSlug: string } }) {
  const seasons = await getAll(params.leagueSlug);
  const league = await LeagueRepository.getLeagueBySlug({
    leagueSlug: params.leagueSlug,
    userId: auth().userId as string,
  });
  const sortedSeason = sortSeasons(seasons);
  const hasEditorAccess = await getHasEditorAccess(league.id);

  return (
    <div className="grid grid-flow-row md:grid-flow-col gap-8 pt-4">
      <div className="flex flex-col gap-2">
        <h1 className="font-bold">Seasons</h1>
        <SeasonTable
          seasons={sortedSeason}
          hasEditorAccess={hasEditorAccess}
          showTopPlayerAndTeam={true}
        />
      </div>
    </div>
  );
}
