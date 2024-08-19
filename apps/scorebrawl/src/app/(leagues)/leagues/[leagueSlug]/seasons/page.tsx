import { AddSeasonButton } from "@/app/(leagues)/leagues/[leagueSlug]/seasons/components/AddSeasonButton";
import { BreadcrumbsHeader } from "@/components/layout/breadcrumbs-header";
import { SeasonTable } from "@/components/season/season-table";
import { api } from "@/trpc/server";

export default async ({ params: { leagueSlug } }: { params: { leagueSlug: string } }) => {
  const hasEditorAccess = await api.league.hasEditorAccess({ leagueSlug });
  return (
    <>
      <BreadcrumbsHeader breadcrumbs={[{ name: "Seasons" }]}>
        {hasEditorAccess && <AddSeasonButton leagueSlug={leagueSlug} />}
      </BreadcrumbsHeader>
      <div className="grid grid-flow-row md:grid-flow-col gap-8 pt-4">
        <div className="flex flex-col gap-2">
          <SeasonTable leagueSlug={leagueSlug} showTopPlayerAndTeam={true} />
        </div>
      </div>
    </>
  );
};
