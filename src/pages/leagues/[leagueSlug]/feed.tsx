import { type NextPage } from "next";
import { api } from "~/lib/api";
import { useLeagueSlug } from "~/hooks/useLeagueSlug";

const LeagueFeed: NextPage = () => {
  const leagueSlug = useLeagueSlug();
  const { data } = api.league.getEvents.useQuery({ leagueSlug });

  return <code>{JSON.stringify(data, null, 2)}</code>;
};

export default LeagueFeed;
