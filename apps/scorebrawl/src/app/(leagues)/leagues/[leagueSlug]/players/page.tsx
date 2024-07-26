import { getLeagueBySlugWithUserRoleOrRedirect } from "@/actions/league";
import { LeaguePlayersTable } from "./components/leaguePlayersTable";
import { LeagueTeamsTable } from "./components/leagueTeamsTable";

export default async function ({ params: { leagueSlug } }: { params: { leagueSlug: string } }) {
  const { id } = await getLeagueBySlugWithUserRoleOrRedirect(leagueSlug);
  return (
    <div className="grid grid-flow-row md:grid-flow-col gap-8 pt-4">
      <div className="flex flex-col gap-2">
        <h1 className="font-bold">Players</h1>
        <LeaguePlayersTable leagueSlug={leagueSlug} />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="font-bold">Teams</h1>
        <LeagueTeamsTable leagueId={id} />
      </div>
    </div>
  );
}
