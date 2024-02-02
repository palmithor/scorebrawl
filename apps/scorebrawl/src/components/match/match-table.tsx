"use client";
import { Match } from "@scorebrawl/db/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@scorebrawl/ui/table";
import { MatchResult } from "./match-result";

export const MatchTable = ({ matches, className }: { matches: Match[]; className?: string }) => (
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
            <div className="flex items-center gap-2 p-1">
              <MatchResult key={match.id} match={match} />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
