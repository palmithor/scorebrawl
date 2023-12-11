import { type NextPage } from "next";
import { LeagueDetailsLayout } from "~/components/league/league-details-layout";
import { LeaguePlayersTable } from "~/components/league/league-players-table";
import { LeagueTeamsTable } from "~/components/league/league-teams-table";
import { Title } from "~/components/title";
import { useLeagueSlug } from "~/hooks/useLeagueSlug";

const LeaguePlayers: NextPage = () => {
  const leagueSlug = useLeagueSlug();

  return (
    <LeagueDetailsLayout>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <div className="flex-col">
          <Title className="pb-4 pt-4" title="Players" />
          <LeaguePlayersTable leagueSlug={leagueSlug} />
        </div>
        <div>
          <Title className="pb-4 pt-4" title="Teams" />
          <LeagueTeamsTable leagueSlug={leagueSlug} />
        </div>
      </div>
    </LeagueDetailsLayout>
  );
};

export default LeaguePlayers;
