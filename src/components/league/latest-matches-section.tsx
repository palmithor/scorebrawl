import { CardTitle } from "~/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { Button } from "~/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import { api } from "~/lib/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { MatchResult } from "~/components/match/match-result";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export const LatestMatchesSection = ({
  leagueSlug,
  className,
}: {
  leagueSlug: string;
  className?: string;
}) => {
  const { user } = useUser();
  const router = useRouter();
  const { data: ongoingSeason } = api.season.getOngoing.useQuery({ leagueSlug }, { retry: false });
  const { data: leaguePlayers } = api.league.getPlayers.useQuery({ leagueSlug });
  const { data: seasonPlayers } = api.season.getPlayers.useQuery(
    { seasonId: ongoingSeason?.id as string },
    { enabled: !!ongoingSeason },
  );
  const { data } = api.match.getAll.useQuery(
    { seasonId: ongoingSeason?.id as string },
    { enabled: !!ongoingSeason },
  );

  const hasLessThanTwoPlayers = seasonPlayers && seasonPlayers.length < 2;

  return (
    <div className={className}>
      <div className="flex flex-col py-4">
        <div className={"flex items-center"}>
          <CardTitle className={"grow"}>
            Latest Matches
            <p className="text-xs text-muted-foreground">
              In season <b>{ongoingSeason?.name}</b>
            </p>
          </CardTitle>
          {ongoingSeason && leaguePlayers?.some((p) => p.userId === user?.id) && (
            <Tooltip>
              <TooltipTrigger>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={hasLessThanTwoPlayers}
                  onClick={() =>
                    void router.push(
                      `/leagues/${leagueSlug}/seasons/${ongoingSeason.id}/matches/create`,
                    )
                  }
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Create Match
                {hasLessThanTwoPlayers && ": Season must have more than two players"}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
      <div className="grid grow">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Results</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((match) => (
                <TableRow key={match.id}>
                  <TableCell>
                    <div className={"text-xs"}>
                      {match.createdAt.toLocaleDateString(window.navigator.language)}{" "}
                      {match.createdAt
                        .toLocaleTimeString(window.navigator.language)
                        .substring(0, 5)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 p-1">
                      <MatchResult key={match.id} match={match} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
