import { type NextPage } from "next";
import { useLeagueSlug } from "~/hooks/useLeagueSlug";
import { LeagueDetailsLayout } from "~/components/league/league-details-layout";
import { api } from "~/lib/api";
import { SeasonCard } from "~/components/season/season-card";

const Seasons: NextPage = () => {
  const leagueSlug = useLeagueSlug();
  const { data } = api.season.getAll.useQuery({ leagueSlug });
  const now = new Date().getTime();
  const items =
    data?.data
      .map((season) => ({
        ...season,
        isOngoing:
          ((season.startDate.getTime() < now && !season.endDate) ||
            (season.startDate.getTime() < now &&
              season.endDate &&
              season.endDate.getTime() > now)) ??
          false,
      }))
      .sort((a, b) => {
        if (a.isOngoing && !b.isOngoing) return -1;
        if (!a.isOngoing && b.isOngoing) return 1;

        return b.startDate.getTime() - a.startDate.getTime();
      }) || [];
  return (
    <LeagueDetailsLayout>
      <div className="s:grid-cols-1 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {items.map((season) => (
          <div key={season.id} className="cursor-pointer">
            <SeasonCard season={season} />
          </div>
        ))}
      </div>
    </LeagueDetailsLayout>
  );
};

export default Seasons;
