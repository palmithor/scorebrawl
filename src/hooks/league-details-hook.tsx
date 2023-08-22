import { useRouter } from "next/router";
import { api } from "~/lib/api";
import { useEffect } from "react";

export const useLeague = () => {
  const router = useRouter();
  const { league: leagueApi, season: seasonApi } = api.useContext();
  const leagueSlug = router.query.leagueSlug as string;
  const {
    data: league,
    isLoading,
    error,
  } = api.league.getBySlug.useQuery({
    leagueSlug,
  });
  const { data: leaguePlayers } = api.league.getPlayers.useQuery({
    leagueSlug,
  });
  const { data: ongoingSeason, isLoading: isLoadingOngoingSeason } =
    api.season.getOngoing.useQuery({
      leagueSlug,
    });
  const {
    data: ongoingSeasonPlayers,
    isLoading: isLoadingOngoingSeasonPlayers,
  } = api.season.getPlayers.useQuery(
    { seasonId: ongoingSeason?.id as string },
    { enabled: !!ongoingSeason }
  );
  const { data: leagueCode } = api.league.getCode.useQuery(
    { leagueSlug },
    { enabled: !!league?.id }
  );
  const { data: hasEditorAccess } = api.league.hasEditorAccess.useQuery(
    {
      leagueSlug,
    },
    { retry: false }
  );

  const { mutateAsync: joinLeagueMutate, isLoading: joinLeagueIsLoading } =
    api.league.join.useMutation();

  useEffect(() => {
    if (error) {
      router.push("/leagues").catch(console.error);
    }
  }, [router, error]);

  const refetchPlayers = async () => {
    await leagueApi.getPlayers.refetch({ leagueSlug });
    if (ongoingSeason) {
      await seasonApi.getPlayers.refetch({ seasonId: ongoingSeason.id });
    }
  };

  return {
    hasEditorAccess,
    isLoading,
    isLoadingOngoingSeason,
    isLoadingOngoingSeasonPlayers,
    joinLeagueIsLoading,
    joinLeagueMutate,
    league,
    leagueCode,
    leaguePlayers,
    ongoingSeason,
    ongoingSeasonPlayers,
    refetchPlayers,
  };
};
