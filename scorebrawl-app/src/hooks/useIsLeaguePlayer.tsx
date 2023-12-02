import { api } from "~/lib/api";
import { useLeagueSlug } from "~/hooks/useLeagueSlug";
import { useUser } from "@clerk/nextjs";

export const useIsLeaguePlayer = () => {
  const leagueSlug = useLeagueSlug();
  const { user } = useUser();
  const { data } = api.league.getPlayers.useQuery({ leagueSlug });

  return data?.some((u) => u?.userId === user?.id && !u.disabled);
};
