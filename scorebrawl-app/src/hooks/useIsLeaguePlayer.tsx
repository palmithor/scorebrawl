import { useUser } from "@clerk/nextjs";
import { useLeagueSlug } from "~/hooks/useLeagueSlug";
import { api } from "~/lib/api";

export const useIsLeaguePlayer = () => {
  const leagueSlug = useLeagueSlug();
  const { user } = useUser();
  const { data } = api.league.getPlayers.useQuery({ leagueSlug });

  return data?.some((u) => u?.userId === user?.id && !u.disabled);
};
