import { type ColumnDef } from "@tanstack/react-table";
import { type SeasonPlayerUser } from "~/server/api/types";

export const columns: ColumnDef<SeasonPlayerUser>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="w-4/5 capitalize"> {row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="w-4/5 capitalize"> {row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "startDate",
    header: "Starts",
    cell: ({ row }) => {
      const dateStr = row
        .getValue<Date>("startDate")
        .toLocaleDateString(window.navigator.language);
      return <div className="w-4/5">{dateStr}</div>;
    },
  },
  {
    accessorKey: "endDate",
    header: "Ends",
    cell: ({ row }) => {
      const dateStr = row
        .getValue<Date>("endDate")
        ?.toLocaleDateString(window.navigator.language);
      return <div className="w-4/5"> {dateStr ? dateStr : "-"}</div>;
    },
  },
];
