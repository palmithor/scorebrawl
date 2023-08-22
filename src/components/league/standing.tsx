import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { AvatarName } from "~/components/user/avatar-name";
import { api } from "~/lib/api";
import { type SeasonPlayerUser } from "~/server/api/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export const SeasonStanding = ({
  className,
  seasonId,
}: {
  className?: string;
  seasonId: string;
}) => {
  const { data } = api.season.getPlayers.useQuery({ seasonId });
  const { data: playerForm } = api.season.playerForm.useQuery({ seasonId });

  const columns: ColumnDef<SeasonPlayerUser>[] = [
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
      accessorKey: "form",
      header: "Form",
      cell: ({ row }) => {
        const form = playerForm?.find(
          (pf) => pf.seasonPlayerId === row.original.id
        )?.form;
        return form ? (
          <div className="flex gap-1">
            {form.map((r, i) => {
              if (r === "W") {
                return (
                  <div
                    key={`${row.original.id}-${r}-${i}`}
                    className="h-2 w-2 rounded-full bg-green-500"
                  ></div>
                );
              } else if (r === "D") {
                return (
                  <div
                    key={`${row.original.id}-${r}-${i}`}
                    className="h-2 w-2 rounded-full bg-yellow-400"
                  ></div>
                );
              } else {
                return (
                  <div
                    key={`${row.original.id}-${r}-${i}`}
                    className="h-2 w-2 rounded-full bg-red-400"
                  ></div>
                );
              }
            })}
          </div>
        ) : null;
      },
    },
    {
      accessorKey: "elo",
      header: "Points",
      cell: ({ row }) => <div> {row.original.elo}</div>,
    },
  ];

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className={className}>
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
    </div>
  );
};
