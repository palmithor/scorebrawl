import { getLeagueBySlugWithUserRoleOrRedirect } from "@/actions/league";
import { BreadcrumbsHeader } from "@/components/layout/breadcrumbs-header";
import { LeaguePlayersTable } from "./components/leaguePlayersTable";

export default async ({ params: { leagueSlug } }: { params: { leagueSlug: string } }) => {
  await getLeagueBySlugWithUserRoleOrRedirect(leagueSlug);
  return (
    <>
      <BreadcrumbsHeader breadcrumbs={[{ name: "Players" }]} />
      <LeaguePlayersTable leagueSlug={leagueSlug} />
    </>
  );
};
