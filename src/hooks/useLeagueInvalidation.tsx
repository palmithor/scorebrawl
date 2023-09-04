import { api } from "~/lib/api";
import { useLeagueSlug } from "~/hooks/useLeagueSlug";

export const useLeagueInvalidation = () => {
  const leagueSlug = useLeagueSlug();
  const { league, season, match } = api.useContext();

  return async (props?: { seasonId?: string }) => {
    if (props?.seasonId) {
      await season.getPlayers.invalidate({ seasonId: props.seasonId });
      await season.playerForm.invalidate({ seasonId: props.seasonId });
    }
    await season.getOngoing.invalidate({ leagueSlug });
    await match.getLatest.invalidate({ leagueSlug });
    await league.getBestForm.invalidate({ leagueSlug });
    await league.getMatchesPlayedStats.invalidate({ leagueSlug });
  };
};
