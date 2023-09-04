import { type NextPage } from "next";
import { useLeagueSlug } from "~/hooks/useLeagueSlug";
import { LeaguePlayersTable } from "~/components/league/league-players-table";
import { LeagueDetailsLayout } from "~/components/league/league-details-layout";

const LeaguePlayers: NextPage = () => {
  const leagueSlug = useLeagueSlug();

  return (
    <LeagueDetailsLayout activeTab={"players"}>
      <LeaguePlayersTable leagueSlug={leagueSlug} />
    </LeagueDetailsLayout>
  );
};

export default LeaguePlayers;
