import { findSeasonBySlug } from "@/actions/season";
import { StandingTabs } from "@/app/(leagues)/leagues/[leagueSlug]/seasons/[seasonSlug]/components/StandingTabs";
import { BreadcrumbsHeader } from "@/components/layout/breadcrumbs-header";
import { MatchForm } from "./components/MatchForm";

type PageParams = { params: { leagueSlug: string; seasonSlug: string } };

export default async ({ params: { leagueSlug, seasonSlug } }: PageParams) => {
  const season = await findSeasonBySlug(leagueSlug, seasonSlug);
  return (
    <div className="grid gap-3">
      <BreadcrumbsHeader
        breadcrumbs={[
          { name: "Seasons", href: `/leagues/${leagueSlug}/seasons` },
          { name: season.name, href: `/leagues/${leagueSlug}/seasons/${seasonSlug}` },
          { name: "Matches", href: `/leagues/${leagueSlug}/seasons/${seasonSlug}/matches` },
          { name: "Create" },
        ]}
      />
      <MatchForm />
      <StandingTabs />
    </div>
  );
};
