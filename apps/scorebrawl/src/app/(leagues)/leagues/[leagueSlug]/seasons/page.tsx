import { AddSeasonButton } from "@/app/(leagues)/leagues/[leagueSlug]/seasons/components/AddSeasonButton";
import { BreadcrumbsHeader } from "@/components/layout/breadcrumbs-header";
import { SeasonTable } from "@/components/season/season-table";

export default async function ({ params: { leagueSlug } }: { params: { leagueSlug: string } }) {
  return (
    <>
      <BreadcrumbsHeader breadcrumbs={[{ name: "Seasons" }]}>
        <AddSeasonButton leagueSlug={leagueSlug} />
      </BreadcrumbsHeader>
      <div className="grid grid-flow-row md:grid-flow-col gap-8 pt-4">
        <div className="flex flex-col gap-2">
          <SeasonTable leagueSlug={leagueSlug} showTopPlayerAndTeam={true} />
        </div>
      </div>
    </>
  );
}
