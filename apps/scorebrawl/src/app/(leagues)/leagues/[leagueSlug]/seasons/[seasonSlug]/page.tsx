import { DashboardCards } from "@/app/(leagues)/leagues/[leagueSlug]/seasons/[seasonSlug]/components/DashboardCards";
import { SeasonStanding } from "@/app/(leagues)/leagues/[leagueSlug]/seasons/[seasonSlug]/components/SeasonTeamStanding";
import { cn } from "@scorebrawl/ui/lib";
import { SeasonPlayerStanding } from "./components/SeasonPlayerStanding";

type PageParams = { params: { leagueSlug: string; seasonSlug: string } };

export default async ({ params: { leagueSlug, seasonSlug } }: PageParams) => {
  return (
    <div className="grid gap-6">
      <DashboardCards leagueSlug={leagueSlug} seasonSlug={seasonSlug} />
      <div className="grid gap-x-4 gap-y-6 m:grid-cols-1 lg:grid-cols-2 items-start">
        <div className={"grid gap-2"}>
          <h2 className={cn("text-xl font-bold tracking-tight")}>Player Standing</h2>
          <SeasonPlayerStanding leagueSlug={leagueSlug} seasonSlug={seasonSlug} />
        </div>
        <div className={"grid gap-2"}>
          <h2 className={cn("text-xl font-bold tracking-tight")}>Team Standing</h2>
          <SeasonStanding leagueSlug={leagueSlug} seasonSlug={seasonSlug} />
        </div>
      </div>
    </div>
  );
};
