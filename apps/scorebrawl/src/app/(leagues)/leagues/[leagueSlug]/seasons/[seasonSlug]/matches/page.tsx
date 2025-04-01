import { findSeasonBySlug } from "@/actions/season";
import { AddMatchButton } from "@/app/(leagues)/leagues/[leagueSlug]/seasons/[seasonSlug]/components/actions/addMatchButton";
import { BreadcrumbsHeader } from "@/components/layout/breadcrumbs-header";
import { MatchesPage } from "./components/MatchesPage";

type PageParams = { params: Promise<{ leagueSlug: string; seasonSlug: string }> };

export default async ({ params }: PageParams) => {
  const { leagueSlug, seasonSlug } = await params;
  const season = await findSeasonBySlug(leagueSlug, seasonSlug);
  const isEloSeason = season.scoreType === "elo";
  return (
    <>
      <BreadcrumbsHeader
        breadcrumbs={[
          { name: "Seasons", href: `/leagues/${leagueSlug}/seasons` },
          { name: season.name, href: `/leagues/${leagueSlug}/seasons/${seasonSlug}` },
          { name: "Matches" },
        ]}
      >
        {isEloSeason && <AddMatchButton />}
      </BreadcrumbsHeader>
      <MatchesPage />
    </>
  );
};
