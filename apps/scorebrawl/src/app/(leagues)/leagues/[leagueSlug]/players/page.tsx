import { BreadcrumbsHeader } from "@/components/layout/breadcrumbs-header";
import { LeaguePlayersTable } from "./components/leaguePlayersTable";

export default ({ params: { leagueSlug } }: { params: { leagueSlug: string } }) => {
  return (
    <>
      <BreadcrumbsHeader breadcrumbs={[{ name: "Players" }]} />
      <div className="grid">
        <LeaguePlayersTable leagueSlug={leagueSlug} />
      </div>
    </>
  );
};
