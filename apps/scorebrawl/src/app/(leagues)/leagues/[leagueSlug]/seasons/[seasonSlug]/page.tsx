import { StatsCards } from "@/app/(leagues)/leagues/[leagueSlug]/seasons/[seasonSlug]/components/StatsCards";

type PageParams = { params: { leagueSlug: string; seasonSlug: string } };

export default ({ params: { leagueSlug, seasonSlug } }: PageParams) => {
  return (
    <div className="grid gap-6">
      <StatsCards leagueSlug={leagueSlug} seasonSlug={seasonSlug} />
    </div>
  );
};
