"use client";
import { useSeason } from "@/context/SeasonContext";
import type { MatchDTO } from "@scorebrawl/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@scorebrawl/ui/table";
import type { z } from "zod";
import { MatchResult } from "./match-result";

export const MatchTable = ({
  matches,
  className,
}: {
  matches: z.infer<typeof MatchDTO>[];
  className?: string;
}) => {
  const { leagueSlug, seasonSlug } = useSeason();

  return (
    <Table className={className}>
      <TableHeader className="hidden sm:table-header-group">
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Results</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {matches.map((match) => (
          <TableRow key={match.id}>
            <TableCell className="hidden sm:table-cell">
              <div className="text-xs">
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
