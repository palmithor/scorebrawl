import { type NextPage } from "next";
import { useRouter } from "next/router";
import { MatchResult } from "~/components/match/match-result";
import { SeasonDetailsLayout } from "~/components/season/season-details-layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api } from "~/lib/api";

const SeasonPlayers: NextPage = () => {
  const seasonId = useRouter().query.seasonId as string;
  const { data } = api.match.getAll.useQuery({ seasonId });

  return (
    <SeasonDetailsLayout>
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
    </SeasonDetailsLayout>
  );
};

export default SeasonPlayers;
