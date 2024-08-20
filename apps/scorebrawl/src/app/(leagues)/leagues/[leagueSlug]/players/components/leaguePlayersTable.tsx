"use client";
import { DateCell } from "@/components/date-cell";
import { api } from "@/trpc/react";
import { AvatarName } from "@scorebrawl/ui/avatar-name";
import { cn } from "@scorebrawl/ui/lib";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@scorebrawl/ui/table";

export const LeaguePlayersTable = ({
  leagueSlug,
}: {
  leagueSlug: string;
}) => {
  const { data } = api.leaguePlayer.getAll.useQuery({ leagueSlug });
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((player) => (
          <TableRow key={player.leaguePlayerId}>
            <TableCell>
              <AvatarName
                avatarClassName="h-8 w-8"
                name={player.user.name}
                imageUrl={player.user.imageUrl || ""}
              />
            </TableCell>
            <TableCell>
              <DateCell date={player.joinedAt} />
            </TableCell>
            <TableCell>
              <div className="flex gap-2 items-center">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    player.disabled ? "bg-rose-900" : "bg-green-400",
                  )}
                />
                <div>{player.disabled ? "Inactive" : "Active"}</div>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
