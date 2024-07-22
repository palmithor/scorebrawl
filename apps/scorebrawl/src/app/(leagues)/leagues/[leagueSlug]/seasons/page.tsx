import { getHasEditorAccess, getLeagueBySlugWithUserRoleOrRedirect } from "@/actions/league";
import { SeasonTable } from "@/components/season/season-table";
import { api } from "@/trpc/server";
import { sortSeasons } from "@/utils/seasonUtils";

export default async function ({ params: { leagueSlug } }: { params: { leagueSlug: string } }) {
  const league = await getLeagueBySlugWithUserRoleOrRedirect(leagueSlug);
  const seasons = await api.season.getAll({ leagueSlug });
  const sortedSeason = sortSeasons(seasons);
  const hasEditorAccess = await getHasEditorAccess(league.id);

  return (
    <div className="grid grid-flow-row md:grid-flow-col gap-8 pt-4">
      <div className="flex flex-col gap-2">
        <h1 className="font-bold">Seasons</h1>
        <SeasonTable
          leagueSlug={leagueSlug}
          seasons={sortedSeason}
          hasEditorAccess={hasEditorAccess}
          showTopPlayerAndTeam={true}
        />
      </div>
    </div>
  );
}
