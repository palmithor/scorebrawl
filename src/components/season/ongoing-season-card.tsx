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
import { type Season } from "~/server/db/types";

export const OngoingSeasonCard = ({
  className,
  ongoingSeason,
  leagueSlug,
}: {
  className?: string;
  ongoingSeason?: Season;
  leagueSlug: string;
}) => {
  const router = useRouter();
  const { data: hasEditorAccess } = api.league.hasEditorAccess.useQuery({
    leagueSlug,
  });

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Ongoing Season</CardTitle>
        {ongoingSeason && <CardDescription>No ongoing season</CardDescription>}
      </CardHeader>
      <CardContent>
        {hasEditorAccess && (
          <div className="items-center justify-center">
            {ongoingSeason && (
              <Button
                onClick={() =>
                  void router.push(`/leagues/${leagueSlug}/seasons/create`)
                }
              >
                Create season
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
