import { useRouter } from "next/router";
import { useEffect } from "react";
import { api } from "~/lib/api";

export const useLeague = (input?: { leagueSlug?: string }) => {
  const router = useRouter();
  const { league: leagueApi, season: seasonApi } = api.useContext();
  const leagueSlug = input?.leagueSlug || (router.query.leagueSlug as string);
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
    api.season.getOngoing.useQuery({ leagueSlug }, { retry: false });
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
