import { SeasonTable } from "@/components/season/season-table";

export default async function ({ params: { leagueSlug } }: { params: { leagueSlug: string } }) {
  return (
    <div className="grid grid-flow-row md:grid-flow-col gap-8 pt-4">
      <div className="flex flex-col gap-2">
        <SeasonTable leagueSlug={leagueSlug} showTopPlayerAndTeam={true} />
      </div>
    </div>
  );
}
