import {
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components";
import { MatchResult } from "~/components/match/match-result";
import { api } from "~/lib/api";

export const LatestMatchesSection = ({
  leagueSlug,
  className,
}: {
  leagueSlug: string;
  className?: string;
}) => {
  const { data: ongoingSeason } = api.season.getOngoing.useQuery({ leagueSlug }, { retry: false });
  const { data } = api.match.getAll.useQuery(
    { seasonId: ongoingSeason?.id as string },
    { enabled: !!ongoingSeason },
  );

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
