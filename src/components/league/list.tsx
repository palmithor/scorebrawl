import { api } from "~/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import React from "react";
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { type Season } from "~/server/db/types";
import { Label } from "@radix-ui/react-dropdown-menu";

export const columns: ColumnDef<Season>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="w-4/5 capitalize"> {row.getValue("name")}</div>,
  },
  {
    accessorKey: "startDate",
    header: "Starts",
    cell: ({ row }) => (
      <div className="w-4/5">
        {row.getValue<Date>("startDate").toLocaleDateString(window.navigator.language)}
      </div>
    ),
  },
  {
    accessorKey: "endDate",
    header: "Ends",
    cell: ({ row }) => {
      const dateStr = (row.getValue<Date>("endDate") as Date | undefined)?.toLocaleDateString(
        window.navigator.language
      );
      return <div className="w-4/5"> {dateStr ? dateStr : "-"}</div>;
    },
  },
];

export const SeasonList = ({
  className,
  leagueSlug,
}: {
  className: string | undefined;
  leagueSlug: string;
}) => {
  const { data } = api.season.getAll.useQuery({ leagueSlug });

  const table = useReactTable({
    data: data?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className={className}>
      <div className="pb-3">
        <Label className="text-sm font-medium">Existing seasons</Label>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
