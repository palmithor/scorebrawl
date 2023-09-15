/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import { api } from "~/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import React from "react";
import { Label } from "~/components/ui/label";

export const SeasonList = ({
  className,
  leagueSlug,
}: {
  className: string | undefined;
  leagueSlug: string;
}) => {
  const { data } = api.season.getAll.useQuery({ leagueSlug });

  return (
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
            {data?.data.map((season) => (
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
};
