import { useLeagueSlug } from "~/hooks/useLeagueSlug";
import { api } from "~/lib/api";

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
      season.playerPointDiff.invalidate(),
      season.teamPointDiff.invalidate(),
      season.playerForm.invalidate(),
      season.teamForm.invalidate(),
    ]);
    if (props?.seasonId) {
      await season.getPlayers.invalidate({ seasonId: props.seasonId });
      await season.getTeams.invalidate({ seasonId: props.seasonId });
      await match.getAll.invalidate({ seasonId: props.seasonId });
    }
  };
};
