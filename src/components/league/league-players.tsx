import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { AvatarName } from "~/components/user/avatar-name";
import { useLeague } from "~/hooks/league-details-hook";
import { type LeaguePlayerUser } from "~/server/api/types";

export const columns: ColumnDef<LeaguePlayerUser>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <AvatarName
        name={row.getValue("name")}
        avatarUrl={row.original.imageUrl}
      />
    ),
  },
  {
    accessorKey: "joinedAt",
    header: "Joined At",
    cell: ({ row }) => (
      <div className="w-4/5">
        {row
          .getValue<Date>("joinedAt")
          ?.toLocaleDateString(window.navigator.language)}
      </div>
    ),
  },
  {
    accessorKey: "disabled",
    header: "Status",
    cell: ({ row }) => (
      <div className="w-4/5">
        {row.getValue("disabled") ? "Disabled" : "Active"}
      </div>
    ),
  },
];

export const LeaguePlayers = ({ className }: { className?: string }) => {
  const { league } = useLeague();

  const table = useReactTable({
    data: league?.players || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>League Players</CardTitle>
      </CardHeader>
      <CardContent>
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
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
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
      </CardContent>
    </Card>
  );
};
