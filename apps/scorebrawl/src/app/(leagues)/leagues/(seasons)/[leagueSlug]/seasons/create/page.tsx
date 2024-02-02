import { getLeagueOrRedirect } from "@/actions/league";
import { getAll } from "@/actions/season";
import { SeasonForm } from "@/components/season/season-form";

export default async function ({ params }: { params: { leagueSlug: string } }) {
  const league = await getLeagueOrRedirect(params.leagueSlug);
  const seasons = await getAll({ leagueSlug: params.leagueSlug });

  return <SeasonForm league={league} seasons={seasons} />;
}
