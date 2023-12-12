/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components";
import { AvatarName } from "~/components/user/avatar-name";
import { api } from "~/lib/api";

export const LeaguePlayersTable = ({ leagueSlug }: { leagueSlug: string }) => {
  const { data } = api.league.getPlayers.useQuery({ leagueSlug });

  return (
    <div className="rounded-md border">
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
            <TableRow key={player.id}>
              <TableCell>
                <AvatarName name={player.name} avatarUrl={player.imageUrl} />{" "}
              </TableCell>
              <TableCell>
                <div>{player.joinedAt.toLocaleDateString(window.navigator.language)}</div>
              </TableCell>
              <TableCell>
                <div>{player.disabled ? "Disabled" : "Active"}</div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
