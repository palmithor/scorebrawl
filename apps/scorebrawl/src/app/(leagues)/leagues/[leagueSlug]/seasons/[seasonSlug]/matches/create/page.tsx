import { SeasonPlayerStanding } from "@/app/(leagues)/leagues/[leagueSlug]/seasons/[seasonSlug]/components/SeasonPlayerStanding";
import { MatchForm } from "./components/MatchForm";

export default async function () {
  return (
    <div className="grid gap-3">
      <MatchForm />
      <SeasonPlayerStanding />
    </div>
  );
}
