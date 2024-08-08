import { findSeasonBySlug } from "@/actions/season";
import { AddMatchButton } from "@/app/(leagues)/leagues/[leagueSlug]/seasons/[seasonSlug]/components/actions/add-match";
import { BreadcrumbsHeader } from "@/components/layout/breadcrumbs-header";
import { MatchesPage } from "./components/MatchesPage";

type PageParams = { params: { leagueSlug: string; seasonSlug: string } };

export default async ({ params: { leagueSlug, seasonSlug } }: PageParams) => {
  const season = await findSeasonBySlug(leagueSlug, seasonSlug);
  return (
    <>
      <BreadcrumbsHeader
        breadcrumbs={[
          { name: "Seasons", href: `/leagues/${leagueSlug}/seasons` },
          { name: season.name, href: `/leagues/${leagueSlug}/seasons/${seasonSlug}` },
          { name: "Matches" },
        ]}
      >
        <AddMatchButton />
      </BreadcrumbsHeader>
      <MatchesPage />
    </>
  );
};
