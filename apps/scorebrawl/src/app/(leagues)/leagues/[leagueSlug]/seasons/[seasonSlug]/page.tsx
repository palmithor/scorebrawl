import { findSeasonBySlug } from "@/actions/season";
import { DashboardCards } from "@/app/(leagues)/leagues/[leagueSlug]/seasons/[seasonSlug]/components/DashboardCards";
import { LatestMatches } from "@/app/(leagues)/leagues/[leagueSlug]/seasons/[seasonSlug]/components/LatestMatches";
import { OverviewCard } from "@/app/(leagues)/leagues/[leagueSlug]/seasons/[seasonSlug]/components/OverviewCard";
import { PointDiffProgression } from "@/app/(leagues)/leagues/[leagueSlug]/seasons/[seasonSlug]/components/PointDiffProgression";
import { PointProgression } from "@/app/(leagues)/leagues/[leagueSlug]/seasons/[seasonSlug]/components/PointProgression";
import { AddMatchButton } from "@/app/(leagues)/leagues/[leagueSlug]/seasons/[seasonSlug]/components/actions/add-match";
import { BreadcrumbsHeader } from "@/components/layout/breadcrumbs-header";
import { currentUser } from "@clerk/nextjs/server";
import { SeasonPlayerStanding } from "./components/SeasonPlayerStanding";
import { SeasonTeamStanding } from "./components/SeasonTeamStanding";

type PageParams = { params: { leagueSlug: string; seasonSlug: string } };

export default async ({ params: { leagueSlug, seasonSlug } }: PageParams) => {
  const season = await findSeasonBySlug(leagueSlug, seasonSlug);
  const _user = await currentUser();
  return (
    <>
      <BreadcrumbsHeader
        breadcrumbs={[
          { name: "Seasons", href: `/leagues/${leagueSlug}/seasons` },
          { name: season.name },
        ]}
      >
        <AddMatchButton />
      </BreadcrumbsHeader>
      <div className="grid gap-6">
        <DashboardCards />
        <div className="grid gap-x-4 gap-y-6 m:grid-cols-1 lg:grid-cols-2 items-start">
          <div className={"grid gap-2"}>
            <SeasonPlayerStanding />
          </div>
          <div className={"grid gap-2"}>
            <SeasonTeamStanding />
          </div>
        </div>
        <div className="grid gap-x-4 gap-y-6 m:grid-cols-1 lg:grid-cols-2 items-start">
          <div className={"grid gap-2"}>
            <LatestMatches />
          </div>
        </div>
        <div className="grid gap-x-4 gap-y-6 m:grid-cols-1 lg:grid-cols-2 items-start">
          <div className={"grid gap-2"}>
            <OverviewCard title={"Point Progression"}>
              <PointProgression />
            </OverviewCard>
          </div>
          <div className={"grid gap-2"}>
            <OverviewCard title={"Daily Point +/-"}>
              <PointDiffProgression />
            </OverviewCard>
          </div>
        </div>
      </div>
    </>
  );
};
