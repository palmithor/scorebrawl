import { SeasonStanding } from "~/components/league/standing";
import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { useRouter } from "next/router";
import { api } from "~/lib/api";

export const OngoingSeasonCard = ({
  className,
  leagueSlug,
}: {
  className?: string;
  leagueSlug: string;
}) => {
  const router = useRouter();
  const { data: hasEditorAccess } = api.league.hasEditorAccess.useQuery(
    { leagueSlug },
    { retry: false }
  );
  const { data: ongoingSeason, isLoading: isLoadingOngoingSeason } = api.season.getOngoing.useQuery(
    { leagueSlug },
    { retry: false }
  );
  const { data: league } = api.league.getBySlug.useQuery({ leagueSlug });

  const cardContent = () => {
    if (isLoadingOngoingSeason) {
      return <Spinner />;
    } else if (ongoingSeason) {
      return <SeasonStanding seasonId={ongoingSeason.id} />;
    } else if (hasEditorAccess) {
      return (
        <Button
          onClick={() => void router.push(`/leagues/${league?.slug as string}/seasons/create`)}
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
          <div className="grow">
            <CardTitle>Standing</CardTitle>
            <p className="pt-1 text-xs text-muted-foreground">
              In season <span className="font-bold">{ongoingSeason?.name}</span>{" "}
              {ongoingSeason?.endDate &&
                ` ending at ${ongoingSeason.endDate.toLocaleDateString(window.navigator.language)}`}
            </p>
          </div>
        </div>
        {!ongoingSeason && !isLoadingOngoingSeason && (
          <CardDescription>No ongoing season</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid">{cardContent()}</div>
      </CardContent>
    </Card>
  );
};
