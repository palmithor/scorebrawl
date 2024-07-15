import { DashboardCards } from "@/app/(leagues)/leagues/[leagueSlug]/seasons/[seasonSlug]/components/DashboardCards";
import { SeasonPlayerStanding } from "./components/SeasonPlayerStanding";

type PageParams = { params: { leagueSlug: string; seasonSlug: string } };

export default async ({ params: { leagueSlug, seasonSlug } }: PageParams) => {
  return (
    <div className="grid gap-6">
      <DashboardCards leagueSlug={leagueSlug} seasonSlug={seasonSlug} />
      <SeasonPlayerStanding leagueSlug={leagueSlug} seasonSlug={seasonSlug} />
    </div>
  );
};
