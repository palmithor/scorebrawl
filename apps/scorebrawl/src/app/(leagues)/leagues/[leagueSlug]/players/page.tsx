import { getBySlug } from "@/actions/league";
import { LeaguePlayersTable } from "@/components/players/league-players-table";
import { LeagueTeamsTable } from "@/components/players/league-teams-table";

export default async function ({ params }: { params: { leagueSlug: string } }) {
  const { id: leagueId } = await getBySlug(params.leagueSlug);
  return (
    <div className="grid grid-flow-row md:grid-flow-col gap-8 pt-4">
      <div className="flex flex-col gap-2">
        <h1 className="font-bold">Players</h1>
        <LeaguePlayersTable leagueId={leagueId} />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="font-bold">Teams</h1>
        <LeagueTeamsTable leagueId={leagueId} />
      </div>
    </div>
  );
}
