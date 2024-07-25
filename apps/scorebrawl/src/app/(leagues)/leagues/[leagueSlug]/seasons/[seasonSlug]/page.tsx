import { DashboardCards } from "@/app/(leagues)/leagues/[leagueSlug]/seasons/[seasonSlug]/components/DashboardCards";
import { LatestMatches } from "@/app/(leagues)/leagues/[leagueSlug]/seasons/[seasonSlug]/components/LatestMatches";
import { SeasonPlayerStanding } from "./components/SeasonPlayerStanding";
import { SeasonTeamStanding } from "./components/SeasonTeamStanding";

type PageParams = { params: { leagueSlug: string; seasonSlug: string } };

export default async ({ params: { leagueSlug, seasonSlug } }: PageParams) => {
  return (
    <div className="grid gap-6">
      <DashboardCards leagueSlug={leagueSlug} seasonSlug={seasonSlug} />
      <div className="grid gap-x-4 gap-y-6 m:grid-cols-1 lg:grid-cols-2 items-start">
        <div className={"grid gap-2"}>
          <SeasonPlayerStanding />
        </div>
        <div className={"grid gap-2"}>
          <SeasonTeamStanding leagueSlug={leagueSlug} seasonSlug={seasonSlug} />
        </div>
      </div>
      <div className="grid gap-x-4 gap-y-6 m:grid-cols-1 lg:grid-cols-2 items-start">
        <div className={"grid gap-2"}>
          <LatestMatches leagueSlug={leagueSlug} seasonSlug={seasonSlug} />
        </div>
      </div>
    </div>
  );
};
