import { getBySlug } from "@/actions/league";
import { findOngoing, getByIdOrOngoing, getMatches, getPlayers } from "@/actions/season";

export default async function ({ params }: { params: { leagueSlug: string } }) {
  const league = await getBySlug(params);
  const ongoingSeason = await findOngoing({ leagueId: league.id });
  const seasonPlayers = ongoingSeason ? await getPlayers({ seasonId: ongoingSeason.id }) : [];
  const seasonMatches = ongoingSeason ? await getMatches({ seasonId: ongoingSeason.id }) : [];

  return <h1>overview</h1>;
}
