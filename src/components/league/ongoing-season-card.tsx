import { useUser } from "@clerk/nextjs";
import { PlusIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/router";
import { SeasonStanding } from "~/components/league/standing";
import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useLeague } from "~/hooks/league-details-hook";

export const OngoingSeasonCard = ({ className }: { className?: string }) => {
  const router = useRouter();
  const { user } = useUser();
  const {
    hasEditorAccess,
    isLoadingOngoingSeason,
    isLoadingOngoingSeasonPlayers,
    league,
    leaguePlayers,
    ongoingSeason,
    ongoingSeasonPlayers,
  } = useLeague();

  const cardContent = () => {
    if (isLoadingOngoingSeason) {
      return <Spinner />;
    } else if (ongoingSeason) {
      return <SeasonStanding seasonId={ongoingSeason.id} />;
    } else if (hasEditorAccess) {
      return (
        <Button
          onClick={() =>
            void router.push(
              `/leagues/${league?.slug as string}/seasons/create`
            )
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
          {ongoingSeason &&
            league &&
            !isLoadingOngoingSeasonPlayers &&
            leaguePlayers?.some((p) => p.userId === user?.id) && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={
                        ongoingSeasonPlayers && ongoingSeasonPlayers.length < 2
                      }
                      onClick={() =>
                        void router.push(
                          `/leagues/${league.slug}/seasons/${ongoingSeason.id}/matches/create`
                        )
                      }
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Create Match
                    {ongoingSeasonPlayers &&
                      ongoingSeasonPlayers.length < 2 &&
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
