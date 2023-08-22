"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { type NextPage } from "next";
import { api } from "~/lib/api";
import { type League } from "~/server/db/types";
import { useRouter } from "next/router";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { getInitialsFromString } from "~/lib/string-utils";

type CellMeta = {
  align: undefined | "left" | "center" | "right" | "justify" | "char";
};

export const columns: ColumnDef<League>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex w-4/5 items-center gap-2 truncate capitalize">
        <Avatar>
          <AvatarImage src={row.original.logoUrl ?? ""} />
          <AvatarFallback>
            {getInitialsFromString(row.getValue("name")).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span>{row.getValue("name")}</span>
      </div>
    ),
  },
];

const Leagues: NextPage = () => {
  const router = useRouter();
  const { data, isLoading } = api.league.getAll.useQuery({
    pageQuery: {},
  });

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const table = useReactTable({
    data: data?.data || [],
    columns,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
  });

  if (isLoading) {
    return <p>loading</p>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter leagues..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex-grow" />
        <Button onClick={() => void router.push("/leagues/create")}>
          Create League
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const align = (header.column.columnDef.meta as CellMeta)
                    ?.align;
                  return (
                    <TableHead
                      key={header.id}
                      align={align}
                      className={align ? `text-${align}` : ""}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => {
                    void router.push(`/leagues/${row.original.slug}`);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      align={(cell.column.columnDef.meta as CellMeta)?.align}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Leagues;
