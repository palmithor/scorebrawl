import { api } from "~/lib/api";
import { useLeagueSlug } from "~/hooks/useLeagueSlug";

export const useLeagueInvalidation = () => {
  const leagueSlug = useLeagueSlug();
  const { league, season, match } = api.useContext();

  return async (props?: { seasonId?: string }) => {
    await Promise.all([
      match.getLatest.invalidate({ leagueSlug }),
      league.getPlayers.invalidate({ leagueSlug }),
      league.getBestForm.invalidate({ leagueSlug }),
      league.getMatchesPlayedStats.invalidate({ leagueSlug }),
      season.getOngoing.invalidate({ leagueSlug }),
    ]);
    if (props?.seasonId) {
      await season.getPlayers.invalidate({ seasonId: props.seasonId });
      await season.playerForm.invalidate({ seasonId: props.seasonId });
    }
  };
};
