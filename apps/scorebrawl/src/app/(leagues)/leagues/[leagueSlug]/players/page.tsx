import { BreadcrumbsHeader } from "@/components/layout/breadcrumbs-header";
import { LeaguePlayersTable } from "./components/leaguePlayersTable";

export default ({ params: { leagueSlug } }: { params: { leagueSlug: string } }) => {
  return (
    <>
      <BreadcrumbsHeader breadcrumbs={[{ name: "Players" }]} />
      <LeaguePlayersTable leagueSlug={leagueSlug} />
    </>
  );
};
