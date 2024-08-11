import { LeagueSettings } from "@/app/(leagues)/leagues/[leagueSlug]/settings/components/LeagueSettings";
import { BreadcrumbsHeader } from "@/components/layout/breadcrumbs-header";

export default async ({ params: { leagueSlug } }: { params: { leagueSlug: string } }) => {
  return (
    <>
      <BreadcrumbsHeader breadcrumbs={[{ name: "Settings" }]} />
      <LeagueSettings leagueSlug={leagueSlug} />
    </>
  );
};
