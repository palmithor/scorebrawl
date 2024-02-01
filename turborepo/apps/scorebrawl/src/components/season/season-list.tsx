"use client";

import { Season } from "@scorebrawl/db/types";
import { Label } from "@scorebrawl/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@scorebrawl/ui/table";

export const SeasonList = ({
  className,
  seasons,
}: {
  className: string | undefined;
  seasons: Season[];
}) => (
  <div className={className}>
    <div className="pb-3">
      <Label className="text-sm font-medium">All seasons</Label>
    </div>
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Starts</TableHead>
            <TableHead>Ends</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {seasons.map((season) => (
            <TableRow key={season.id}>
              <TableCell>
                <div className="w-4/5 capitalize"> {season.name}</div>
              </TableCell>
              <TableCell>
                <div>{season.startDate.toLocaleDateString(window.navigator.language)}</div>
              </TableCell>
              <TableCell>
                <div>
                  {season.endDate
                    ? season.endDate.toLocaleDateString(window.navigator.language)
                    : "-"}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);
