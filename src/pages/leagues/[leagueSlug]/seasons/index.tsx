import { type NextPage } from "next";
import { LeagueDetailsLayout } from "~/components/league/league-details-layout";

const Seasons: NextPage = () => {
  return (
    <LeagueDetailsLayout activeTab={"seasons"}>
      <div>Seasons</div>
    </LeagueDetailsLayout>
  );
};

export default Seasons;
