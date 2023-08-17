import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { api } from "~/lib/api";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/router";
import { SeasonStanding } from "~/components/league/standing";
import { PlusIcon } from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Spinner } from "~/components/spinner";

export const OngoingSeasonCard = ({
  className,
  leagueSlug,
}: {
  className?: string;
  leagueSlug: string;
}) => {
  const router = useRouter();
  const { data: ongoingSeason, isLoading: isLoadingOngoingSeason } =
    api.season.getOngoing.useQuery(
      { leagueSlug: leagueSlug },
      { retry: false }
    );
  const { data: players, isLoading: isLoadingPlayers } =
    api.season.getPlayers.useQuery(
      {
        seasonId: ongoingSeason?.id as string,
      },
      { enabled: !!ongoingSeason }
    );
  const { data: hasEditorAccess } = api.league.hasEditorAccess.useQuery(
    {
      leagueSlug,
    },
    { retry: false }
  );

  const cardContent = () => {
    if (isLoadingOngoingSeason || isLoadingPlayers) {
      return <Spinner />;
    } else if (ongoingSeason) {
      return <SeasonStanding seasonId={ongoingSeason.id} />;
    } else if (hasEditorAccess) {
      return (
        <Button
          onClick={() =>
            void router.push(`/leagues/${leagueSlug}/seasons/create`)
          }
        >
          Create season
        </Button>
      );
    } else {
      return <div className="text">Editors must create a season</div>;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex">
          <CardTitle className="grow">Current season standings</CardTitle>
          {ongoingSeason && !isLoadingPlayers && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={players && players.length < 2}
                    onClick={() =>
                      void router.push(
                        `/leagues/${leagueSlug}/seasons/${ongoingSeason.id}/matches/create`
                      )
                    }
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Create Match
                  {players &&
                    players.length < 2 &&
                    ": Season must have more than two players"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {!ongoingSeason && !isLoadingOngoingSeason && (
          <CardDescription>No ongoing season</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="items-center justify-center">{cardContent()}</div>
      </CardContent>
    </Card>
  );
};
