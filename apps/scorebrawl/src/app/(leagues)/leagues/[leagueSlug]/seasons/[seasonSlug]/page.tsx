import { DashboardCards } from "@/app/(leagues)/leagues/[leagueSlug]/seasons/[seasonSlug]/components/DashboardCards";

type PageParams = { params: { leagueSlug: string; seasonSlug: string } };

export default ({ params: { leagueSlug, seasonSlug } }: PageParams) => {
  return (
    <div className="grid gap-6">
      <DashboardCards leagueSlug={leagueSlug} seasonSlug={seasonSlug} />
    </div>
  );
};
