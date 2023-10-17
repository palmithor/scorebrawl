import { type NextPage } from "next";
import { useLeagueSlug } from "~/hooks/useLeagueSlug";
import { LeagueDetailsLayout } from "~/components/league/league-details-layout";
import { api } from "~/lib/api";
import { SeasonCard } from "~/components/season/season-card";

const Seasons: NextPage = () => {
  const leagueSlug = useLeagueSlug();
  const { data } = api.season.getAll.useQuery({ leagueSlug });

  return (
    <LeagueDetailsLayout activeTab={"seasons"}>
      {data?.data.map((season) => (
        <div key={season.id} className="s:grid-cols-1 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SeasonCard season={season} />
        </div>
      ))}
    </LeagueDetailsLayout>
  );
};

export default Seasons;
