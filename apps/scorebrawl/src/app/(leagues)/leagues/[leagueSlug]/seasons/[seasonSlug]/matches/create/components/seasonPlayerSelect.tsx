import { useSeason } from "@/context/SeasonContext";
import { api } from "@/trpc/react";

export const SeasonPlayerSelect = () => {
  const { leagueSlug, seasonSlug } = useSeason();
  const { data } = api.seasonPlayer.getAll.useQuery({ leagueSlug, seasonSlug });
  console.log(data);

  return <div>SeasonPlayerSelect</div>;
};
