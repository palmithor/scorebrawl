"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@scorebrawl/ui/table";
import { MatchResult } from "./match-result";

export const MatchTable = ({
  leagueSlug,
  seasonSlug,
  matches,
  className,
}: {
  leagueSlug: string;
  seasonSlug: string;
  matches: Array<{
    id: string;
    homeScore: number;
    awayScore: number;
    createdAt: Date;
    homeTeamSeasonPlayerIds: Array<string>;
    awayTeamSeasonPlayerIds: Array<string>;
  }>;
  className?: string;
}) => {
  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Results</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {matches.map((match) => (
          <TableRow key={match.id}>
            <TableCell>
              <div className={"text-xs"}>
                {match.createdAt.toLocaleDateString(window.navigator.language)}{" "}
                {match.createdAt.toLocaleTimeString(window.navigator.language).substring(0, 5)}
              </div>
            </TableCell>
            <TableCell>
              <div className="grid">
                <MatchResult
                  key={match.id}
                  match={match}
                  leagueSlug={leagueSlug}
                  seasonSlug={seasonSlug}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
