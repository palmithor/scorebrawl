import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { AvatarName } from "~/components/user/avatar-name";
import { api } from "~/lib/api";
import { type SeasonPlayerUser } from "~/server/api/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { FormDots } from "./form-dots";
import * as React from "react";

export const SeasonStanding = ({
  className,
  seasonId,
}: {
  className?: string;
  seasonId: string;
}) => {
  const { data } = api.season.getPlayers.useQuery({ seasonId });
  const { data: playerForm } = api.season.playerForm.useQuery({ seasonId });

  return (
    <div className={className}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableHead>Name</TableHead>
            <TableHead>Form</TableHead>
            <TableHead>Points</TableHead>
          </TableHeader>
          <TableBody>
            {data?.map((player) => (
              <TableRow key={player.id}>
                <TableCell>
                  <AvatarName name={player.name} avatarUrl={player.imageUrl} />
                </TableCell>
                <TableCell>
                  <FormDots
                    form={playerForm?.find((pf) => pf.seasonPlayerId === player.id)?.form ?? []}
                  />
                </TableCell>
                <TableCell>
                  <div className="font-bold">{player.elo}</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
