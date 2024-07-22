import { getPlayers } from "@/actions/league";
import { DateCell } from "@/components/date-cell";
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

export const LeaguePlayersTable = async ({
  leagueId,
}: {
  leagueId: string;
}) => {
  const players = await getPlayers(leagueId);
  return (
    <div className="rounded-md border px-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players?.map((player) => (
            <TableRow key={player.id}>
              <TableCell>
                <AvatarName
                  avatarClassName="h-8 w-8"
                  name={player.name}
                  imageUrl={player.imageUrl || ""}
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
    </div>
  );
};
